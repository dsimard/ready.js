logger = require("./logger");

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
    
    // Extend config file
    for (var p in r.config) {
      r.config[p] = typeof(extConfig[p]) === "undefined" ? r.config[p] : extConfig[p];
    }
    
    // Check if argv has values
    var argv = require('optimist').argv;
    
    r.config.src = argv.s || argv.src || r.config.src;
    r.config.dest = argv.d || argv.dest || r.config.dest;

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
    r.logger.debug("== Configuration ==");
    for (var p in r.config) {
      logger.debug(p.toString() + " : " + r.config[p].toString());
    }
  },
  loadConfigFromArg : function(argv, callback) {
    var configAsString = function(conf) {
      // Put values in variable
      process.compile('var extConfig = ' + conf, "config_file.js");
      r.loadConfig(extConfig);
      callback();
    }
  
    if (argv._[0]) {
      // Load the config file
      fs.stat(argv._[0], function(err, stats) {
        if (!err && stats.isFile()) {
          fs.readFile(argv._[0], function(err, text) {
            var conf = text.toString();
            configAsString(conf);
          });
        } else {
          conf = process.argv[2];
          configAsString(conf);
        }
      });
    } else {
      // Just load config
      r.loadConfig();
      callback()
    }
  }
}
  
module.exports = r;
