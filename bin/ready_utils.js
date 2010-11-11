var fs = require("fs"),
  sys = require("sys");
  
var r = {
  allJsFiles : [], // Contains a list of all js
  config : {
    src : "./", // the source dir of js files
    dest : "./compiled", // the destination of your minified files
    compiledExtension : "min", // extension of the minified file
    runJslint : true, // if should run jsLint
    runGCompiler : true, // if should run GoogleCompiler
    keepCompiled : false, // if should keep the minified files
    aggregateTo : "", // If a string is specified, all the .js will be aggregated to this file in the config.dest      
    order : [], // The order of aggregation (example : we want jquery before jquery.ui) Must not specified every file.
    exclude : [], // Files that are not compiled but still aggregated
    test : false, // If it's running from test environment
    debug : false, // If in debug mode
  },
  logger : {
    debug : function(msg) {
      if (r.config.debug === true) {
        console.log(msg);
        for (var i = 1, arg; arg = arguments[i]; i++) {
          console.log(sys.inspect(arg));
        }
      }
    },
    warn : function(msg) {
      console.log("WARNING : " + msg);
    },
    log : function(msg) {
      console.log(msg);
    },
    error : function(msg) {
      process.exit(1);
      console.log("ERROR : " + msg);
    },
  },
  loadConfig : function(extConfig) {
    extConfig = extConfig || {};
    
    // Extend config file
    for (var p in r.config) {
      r.config[p] = typeof(extConfig[p]) === "undefined" ? r.config[p] : extConfig[p];
    }

    // Minified extension must be letters or numbers
    if (r.config.runGCompiler && !r.config.compiledExtension.match(/^[0-9a-zA-Z]+$/)) {
      r.logger.log("config.compiledExtension is not valid. Using 'min' as default value.");
      r.config.compiledExtension = "min";
    }
          
    // src and dest must be different
    if (r.config.src == r.config.dest) {
      var src = r.config.src;
      src = r.config.src + (r.config.src.match(/\/$/) ? "" : "/");
      r.config.dest = src + "minified/"
      r.logger.log("config.src and config.dest must be different. Using '"+r.config.dest
        +"' as default value for config.dest.");          
    }
                  
    // Show config
    r.logger.debug("== Configuration ==");
    for (var p in r.config) {
      r.logger.debug(p.toString() + " : " + r.config[p].toString());
    }
  },
  loadConfigFromArg : function(callback) {
    var configAsString = function(conf) {
      // Put values in variable
      process.compile('var extConfig = ' + conf, "config_file.js");
      r.loadConfig(extConfig);
      callback();
    }
  
    fs.stat(process.argv[2], function(err, stats) {
      if (!err && stats.isFile()) {
        fs.readFile(process.argv[2], function(err, text) {
          var conf = text.toString();
          configAsString(conf);
        });
      } else {
        conf = process.argv[2];
        configAsString(conf);
      }
    });
  },
  // Run through all js
  forEachJs : function(callback) {
    fs.readdir(r.config.src, function(err, files) {
      if (!err) {
        // Only process js files
        r.allJsFiles = files.filter(function(f) {
          return f.match(/\.js$/i);
        }).map(function(f) {
          return fs.realpathSync(r.config.src + "/" + f);
        });
        
        // For each file, callback
        r.allJsFiles.forEach(function(f, i) {
          callback(f);
        });
        
      } else {
        r.logger.warn("No files to process");
      }
    });
  }
}

module.exports = r;
