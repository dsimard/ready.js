var fs = require("fs"),
  sys = require("sys");
  
var r = {
  allJsFiles : [], // Contains a list of all js
  allCssFiles : [],
  config : {
	compileJs : true, // if should compile js
	compileCss : true,
    src : "./", // the source dir of js files
	srcCss : "./css",
    dest : "./compiled", // the destination of your minified files
	destCss: "./compiled_css",
    compiledExtension : "min", // extension of the minified file
    runJslint : true, // if should run jsLint
    runGCompiler : true, // if should run GoogleCompiler
	runYUICompiler : false, // if should run YUICompressor
    keepCompiled : false, // if should keep the minified files
    aggregateTo : "all.js", // If a string is specified, all the .js will be aggregated to this file in the config.dest 
    aggregateToCss : "all.css",
    order : [], // The order of aggregation (example : we want jquery before jquery.ui) Must not specified every file
	orderCss : [],
    exclude : [], // Files that are not compiled but still aggregated
	excludeCss : [],
    recursive : true, // Should look for javascript recursively
	recursiveCss : true,
    test : false, // If it's running from test environment
    debug : false, // If in debug mode
	aggregatedHeadingComment: "Aggregated JS",
	aggregatedHeadingCommentCss: "Aggregated CSS"
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
      console.log("ERROR : " + msg);
      process.exit(1);
    },
  },
  loadConfig : function(extConfig) {
    extConfig = extConfig || {};
    
    // Extend config file
    for (var p in r.config) {
      r.config[p] = typeof(extConfig[p]) === "undefined" ? r.config[p] : extConfig[p];
    }

    // Minified extension must be letters or numbers
    if ( ( ( r.config.compileJs && (r.config.runGCompiler || r.config.runYUICompiler) ) || r.config.compileCss ) && !r.config.compiledExtension.match(/^[0-9a-zA-Z]+$/)) {
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
	
	if (r.config.srcCss == r.config.destCss) {
      var srcCss = r.config.srcCss;
      srcCss = r.config.srcCss + (r.config.srcCss.match(/\/$/) ? "" : "/");
      r.config.destCss = srcCss + "minified/"
      r.logger.log("config.srcCss and config.destCss must be different. Using '"+r.config.destCss
        +"' as default value for config.dest.");          
    }
                  
    // Show config
    r.logger.debug("== Configuration ==");
    for (var p in r.config) {
      r.logger.debug(p.toString() + " : " + r.config[p].toString());
    }
	r.logger.debug("===================");
	r.logger.debug("");
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
  forEachJs : function(callback, dir) {
    dir = dir || r.config.src;
  
    fs.readdir(dir, function(err, files) {
      if (!err) {
        // Get real path
        files = files.map(function(f) {
          return fs.realpathSync(dir + "/" + f);
        })
      
        // Only process js files
        var jsFiles = files.filter(function(f) {
          return f.match(/\.js$/i);
        });

        // Add files to all files
        r.allJsFiles = r.allJsFiles.concat(jsFiles);
        
        // Check subfolders
        if (r.config.recursive) {
          // Get the real path of the dest
          fs.realpath(r.config.dest + "/", function(err, destPath) {
            files.forEach(function(f) {
              fs.stat(f, function(err, stats) {
                if (stats.isDirectory()) {
                  // Check that dest and this path are not the same
                  fs.realpath(f + "/", function(err, currentPath) {
                    if (currentPath != destPath) {
                      r.forEachJs(callback, f);
                    }
                  });
                }
              });
            });
          });
        }
        
        // For each file, callback
        jsFiles.forEach(function(f, i) {
          callback(f);
        });
        
      } else {
        r.logger.warn("No JS files to process");
      }
    });
  },
	
  // Run through all js
  forEachCss : function(callback, dir) {
    dir = dir || r.config.srcCss;

    fs.readdir(dir, function(err, files) {
      if (!err) {
        // Get real path
        files = files.map(function(f) {
          return fs.realpathSync(dir + "/" + f);
        })

        // Only process js files
        var cssFiles = files.filter(function(f) {
          return f.match(/\.css$/i);
        });

        // Add files to all files
        r.allCssFiles = r.allCssFiles.concat(cssFiles);

        // Check subfolders
        if (r.config.recursiveCss) {
          // Get the real path of the dest
          fs.realpath(r.config.dest + "/", function(err, destPath) {
            files.forEach(function(f) {
              fs.stat(f, function(err, stats) {
                if (stats.isDirectory()) {
                  // Check that dest and this path are not the same
                  fs.realpath(f + "/", function(err, currentPath) {
                    if (currentPath != destPath) {
                      r.forEachCss(callback, f);
                    }
                  });
                }
              });
            });
          });
        }

        // For each file, callback
        cssFiles.forEach(function(f, i) {
          callback(f);
        });

      } else {
        r.logger.warn("No CSS files to process");
      }
    });
  },

  // If a file is excluded
  isExcluded : function(file) {
    if (typeof(r.config.exclude) == "string") { r.config.exclude = [r.config.exclude]; }
    var filename = file.substring(file.lastIndexOf("/")+1);
    return r.config.exclude.indexOf(filename) >= 0
  },
  isExcludedCss : function(file) {
    if (typeof(r.config.excludeCss) == "string") { r.config.excludeCss = [r.config.excludeCss]; }
    var filename = file.substring(file.lastIndexOf("/")+1);
    return r.config.excludeCss.indexOf(filename) >= 0
  },
  showJslintErrors : function (jslint) {
    jslint.errors.reverse().forEach(function(e) {
      if (e) {
        r.logger.log([e.line.toString(), ",", e.character.toString(), " : ",
          (e.evidence || "").replace(/^\s*|\s*$/g, ""), " ===> ", e.reason].join(""));
      }
    });
  }
}

module.exports = r;
