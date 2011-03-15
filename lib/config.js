var logger = require("./logger"),
  argv = require("optimist").argv,
  path = require("path"),
  fs = require("fs");

var r = {
  config : {
    src : "./", // the source dir of js files
    dest : "./compiled", // the destination of your minified files
    compiledExtension : "min", // extension of the minified file
    runJslint : true, // if should run jsLintf
    runGCompiler : true, // if should run GoogleCompiler
    keepCompiled : false, // if should keep the minified files
    aggregateTo : "all.js", // If a string is specified, all the .js will be aggregated to this file in the config.dest      
    order : [], // The order of aggregation (example : we want jquery before jquery.ui) Must not specified every file.
    exclude : [], // Files that are not compiled but still aggregated
    recursive : true, // Should look for javascript recursively
    test : false, // If it's running from test environment
    debug : false, // If in debug mode
  },
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
    
    // Boolean inversion
    r.config.keepCompiled       = (argv["keep"] !== undefined) ? !def.keepCompiled : r.config.keepCompiled;
    r.config.runJslint          = (argv["nojslint"] !== undefined) ? !def.runJslint : r.config.runJslint;
    r.config.runGCompiler       = (argv["nocompiler"] !== undefined) ? !def.runGCompiler : r.config.runGCompiler;
    r.config.recursive          = (argv["norecursive"] !== undefined) ? !def.recursive : r.config.recursive;    

    // Minified extension must be letters or numbers
    if (r.config.runGCompiler && !r.config.compiledExtension.match(/^[0-9a-zA-Z]+$/)) {
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
    logger.debug("== Configuration ==");
    for (var p in r.config) {
      logger.debug(p.toString() + " : " + r.config[p].toString());
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
