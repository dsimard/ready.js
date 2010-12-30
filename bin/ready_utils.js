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
    runGCompiler : false, // if should run GoogleCompiler rather than YUI
    keepCompiled : false, // if should keep the minified files
    aggregateTo : "all.js", // If a string is specified, all the .js will be aggregated to this file in the config.dest 
    aggregateToCss : "all.css",
    order : [], // The order of aggregation (example : we want jquery before jquery.ui) Must not specified every file
	orderCss : [],
    exclude : [], // Files that are not compiled but still aggregated
	excludeCss : [],
	ignore : [], // Files that are not compiled or aggregated...completely ignored
	ignoreCss : [],
    recursive : true, // Should look for javascript recursively
	recursiveCss : true,
    test : false, // If it's running from test environment
    debug : false, // If in debug mode
	aggregatedHeadingComment: "Aggregated JS",
	aggregatedHeadingCommentCss: "Aggregated CSS",
	jsLintOptions : {
        adsafe     : false, // if ADsafe should be enforced
        bitwise    : false, // if bitwise operators should not be allowed
        browser    : false, // if the standard browser globals should be predefined
        cap        : false, // if upper case HTML should be allowed
        css        : false, // if CSS workarounds should be tolerated
        debug      : false, // if debugger statements should be allowed
        devel      : false, // if logging should be allowed (console, alert, etc.)
        eqeqeq     : false, // if === should be required
        evil       : false, // if eval should be allowed
        forin      : false, // if for in statements must filter
        fragment   : false, // if HTML fragments should be allowed
        immed      : false, // if immediate invocations must be wrapped in parens
        laxbreak   : false, // if line breaks should not be checked
        newcap     : false, // if constructor names must be capitalized
        nomen      : false, // if names should be checked
        on         : false, // if HTML event handlers should be allowed
        onevar     : false, // if only one var statement per function should be allowed
        passfail   : false, // if the scan should stop on first error
        plusplus   : false, // if increment/decrement should not be allowed
        regexp     : false, // if the . should not be allowed in regexp literals
        rhino      : false, // if the Rhino environment globals should be predefined
        undef      : false, // if variables should be declared before used
        safe       : false, // if use of some browser features should be restricted
        sidebar    : false, // if the System object should be predefined
        strict     : false, // require the "use strict"; pragma
        sub        : false, // if all forms of subscript notation are tolerated
        white      : false, // if strict whitespace rules apply
        widget     : false  // if the Yahoo Widgets globals should be predefined
    }
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
    if ( ( r.config.compileJs || r.config.compileCss ) && !r.config.compiledExtension.match(/^[0-9a-zA-Z]+$/)) {
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
		var allJsFiles = files.filter(function(f) {
          return f.match(/\.js$/i);
        });
		// Remove ignored from those to check against for aggregation
        var jsFilesToBeAggregated = allJsFiles.filter(function(f) {
          return !r.isIgnored(f);
        });

        // Add files to all files
        r.allJsFiles = r.allJsFiles.concat(jsFilesToBeAggregated);
        
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
        allJsFiles.forEach(function(f, i) {
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
	  var allfiles = files;
      if (!err) {
        // Get real path
        files = files.map(function(f) {
          return fs.realpathSync(dir + "/" + f);
        })

        // Only process css files
        var allCssFiles = files.filter(function(f) {
          return f.match(/\.css$/i);
        });
		// Remove ignored from those to check against for aggregation
		var cssFilesToBeAggregated = allCssFiles.filter(function(f) {
          return !r.isIgnored(f, 'css');
        });

        // Add files to all files
        r.allCssFiles = r.allCssFiles.concat(cssFilesToBeAggregated);
		
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
        allCssFiles.forEach(function(f, i) {
          callback(f);
        });

      } else {
        r.logger.warn("No CSS files to process");
      }
    });
  },

  // If a file is excluded
  isExcluded : function(file, type) {
	var excluded = (type && type == 'css') ? r.config.excludeCss : r.config.exclude,
	filename = file.substring(file.lastIndexOf("/")+1);
    if (typeof(excluded) == "string") { excluded = [excluded]; }
    return excluded.indexOf(filename) >= 0
  },
  // If a file is ignored
  isIgnored : function(file, type) {
	var ignored = (type == 'css') ? r.config.ignoreCss : r.config.ignore,
	filename = file.substring(file.lastIndexOf("/")+1);
    if (typeof(ignored) == "string") { ignored = [ignored]; }
    return ignored.indexOf(filename) >= 0
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
