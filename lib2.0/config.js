var inspect = require("util").inspect,
  logger = require("./logger"),
  argv = require("../node_modules/optimist").argv,
  path = require("path"),
  fs = require("fs");

var r = {
  config : (function() {
    var c = { src : "./", // the source dir of js files
      dest : "./compiled", // the destination of your minified files
      compiledExtension : "min", // extension of the minified file
      analyse : true, // if should analyse the files with jslint
      compile : true, // if should run the compiler
      aggregate : true, // if should aggregate
      keepCompiled : false, // if should keep the minified files
      aggregateTo : "all.js", // If a string is specified, all the .js will be aggregated to this file in the config.dest      
      order : [], // The order of aggregation (example : we want jquery before jquery.ui) Must not specified every file.
      exclude : [], // Files that are not compiled but still aggregated
      recursive : true, // Should look for javascript recursively
      test : false, // If it's running from test environment
      analysisOptions: {} // Options for the analysis (jshint)
    };
    
    // Add the args shortcut to avoid conflict
    c.s = c.src,
    c.d = c.dest,
    c.compiledext = c.compiledExtension,
    c.runJslint = c.analyse,
    c.runGCompiler = c.compile,
    c.aggto = c.aggregateTo,
    c.keep = c.keepCompiled,
    c.nocompiler = null,
    c.nojslint = null,
    c.norecursive = null,
    c.e = c.exclude,
    c.o = c.order,
    c.jslintOptions = c.analysisOptions;  
    
    return c;
  })(),
  
  loadConfig : function(extConfig) {
    extConfig = extConfig || {};
    def = {};
    
    // Extend config file
    for (var p in r.config) {
      def[p] = r.config[p];
      r.config[p] = typeof(extConfig[p]) === "undefined" ? r.config[p] : extConfig[p];
    }
    
    // Override all config with args
    r.config.src                = argv.s || argv.src || r.config.src;
    r.config.dest               = argv.d || argv.dest || r.config.dest;
    r.config.compiledExtension  = argv.compiledext || r.config.compiledExtension;
    r.config.aggregateTo        = argv.aggto || r.config.aggregateTo;
    r.config.aggregate          = (argv["aggregate"] === undefined) ? def.aggregate : argv["aggregate"];
    
    // Boolean inversion
    r.config.keepCompiled       = (argv["keep"] !== undefined) ? !def.keepCompiled : r.config.keepCompiled;
    r.config.debug              = (argv["debug"] !== undefined) ? !def.debug : r.config.debug;
    
    // Override old config with new
    r.config.analyse            = (argv["nojslint"] !== undefined) ? !def.runJslint : r.config.runJslint;
    r.config.analyse            = (argv["analysis"] !== undefined) ? argv["analysis"]: r.config.analyse;
    r.config.compile            = (argv["nocompiler"] !== undefined) ? !def.runGCompiler : r.config.runGCompiler;
    r.config.compile            = (argv["compile"] !== undefined) ? argv["compile"] : r.config.compile;
    r.config.recursive          = (argv["norecursive"] !== undefined) ? !def.recursive : r.config.recursive;
    r.config.recursive          = (argv["recursive"] !== undefined) ? argv["recursive"] : r.config.recursive;
    
    // Arrays
    if (argv.e || argv.exclude) {
      var exclude = argv.e || argv.exclude;
      r.config.exclude = exclude.split(",").map(function(a) { 
        return a.replace(/\s/g, ""); 
      });
    }
    
    if (argv.o || argv.order) {
      var order = argv.o || argv.order;
      r.config.order = order.split(",").map(function(a) { 
        return a.replace(/\s/g, ""); 
      });
    }
    
    // Aliases for backward compatibility
    r.config.runJslint = r.config.analyse;
    r.config.runGCompiler = r.config.compile;
    
    // If aggregateTo is empty, should not aggregate
    if (r.config.aggregateTo.length == 0) {
      r.config.aggregate = false;
    }
    
    // Every other arg parameters is considered a jslint option
    var jslintArgs = Object.getOwnPropertyNames(argv).filter(function(element, index) {
      return r.config[element] === undefined;
    });
    
    jslintArgs.forEach(function(i, e) {
      var v = parseInt(argv[i]);
      if (isNaN(v)) {
        // Check if bool
        var boolMatch = argv[i].toString().match(/^true|false$/g);
        v = boolMatch && boolMatch.length == 1 ? boolMatch[0] === "true" : null;
      }
      
      if (v !== null) r.config.analysisOptions[i] = v;
    });
            
    // Minified extension must be letters or numbers
    if (r.config.compile && !r.config.compiledExtension.match(/^[0-9a-zA-Z]+$/)) {
      logger.log("config.compiledExtension is not valid. Using 'min' as default value.");
      r.config.compiledExtension = "min";
    }
          
    // src and dest must be different
    if (r.config.src == r.config.dest) {
      var src = r.config.src;
      src = r.config.src + (r.config.src.match(/\/$/) ? "" : "/");
      r.config.dest = src + "minified/"
      logger.log("config.src and config.dest must be different. Using '"+r.config.dest
        +"' as default value for config.dest.");          
    }

    // Show config
    if (r.config.debug) {
      console.log("== Configuration ==");
      console.log(inspect(r.config));
    }
  },
  loadConfigFromArg : function() {
    // Watch file?
    if (argv.w || argv.watch) {
      r.loadConfig({src : argv.w || argv.watch});
      
    // Check if should load config file
    } else if (argv._.length == 1) {
      // Load the config file
      var configPath = path.resolve(argv._[0]);
      
      // NOTE : Config loading is sync because it was less trouble
      try {
        var text = fs.readFileSync(configPath);
        require("vm").runInThisContext("var ext = " + text.toString());
        r.loadConfig(ext);
      } catch(e) {
        r.loadConfig();
      }
    } else if (argv._.length == 2) {
      r.loadConfig({src : argv._[0],
        dest : argv._[1]
      });
    } else {
      // Just load config
      r.loadConfig();
    }
  }
}

r.loadConfigFromArg();

module.exports = r.config;
