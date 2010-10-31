exports = (function() {
  var sys = require("sys");
  var fs = require("fs");
  var cp = require('child_process');
  
  var r = {
    /******* PROPERTIES *******/
    wd : "",
    config : {
      src : "./", // the source dir of js files
      dest : "./min", // the destination of your minified files
      debug : false, // if debug mode
      minifiedExtension : "min", // extension of the minified file
      runJsLint : true, // if should run jsLint
      runGCompiler : true, // if should run GoogleCompiler
      watch : false, // if should watch the js files and exec ready.js each time they changes
      aggregateTo : "", // If a string is specified, all the .js will be aggregated
    },
    /******* PRIVATE *******/
    execute : function(options) {
      var execOpts = {
        onEnd : options ? options.onEnd : null,
      };
      
      r.execWithConfig(execOpts);
    },
    initWorkingDir : function(cb) {
      // Get the working dir
      cp.exec("git rev-parse --show-cdup", function(error, stdout, stderr) {
        stdout = stdout.toString().replace(/\s*$/, "")
        r.wd = fs.realpathSync(stdout.toString());
        r.debug("Working directory : ", r.wd);
        if (cb) { cb() };
      });
    },
    loadConfig : function(argv) {
      // If the arg is a file, use it as config file. Else, load directly
      var arg = argv || process.argv[2];
      
      var isFile = null;
      try {
        isFile = fs.statSync(arg).isFile();
      } catch(err) {
      }

      var confJson = arg;
      if (isFile === true) {
        confJson = fs.readFileSync(arg).toString();
      } 
      // Put values in variable
      process.compile('var config = ' + confJson, "execWithArgs.js");
      
      if (config) {
        // Extend config file
        for (var p in r.config) {
          r.config[p] = typeof(config[p]) == "undefined" ? r.config[p] : config[p];
        }
        
        // Check config
        if (r.config.watch) {
          if (r.shouldAggregate()) {
            r.warn("Cannot use config.watch and config.aggregateTo. Dropped config.aggregateTo.");
            r.config.aggregateTo = "";
          }
          
          if (r.config.runGCompiler) {
            r.warn("Cannot use config.watch and config.runGCompiler. Dropped config.runGCompiler.");
            r.config.runGCompiler = false;
          }
          
          if (r.config.runJsLint === false) {
            r.log("config.watch implies config.runJsLint to TRUE. Changing value.");
            r.config.runJsLint = true;
          }
        }
        
        if (r.config.runGCompiler && r.config.minifiedExtension.length == 0) {
          r.log("config.minifiedExtension can't be empty. Using 'min' as default value");
          r.config.minifiedExtension = 'min';
        }
        
        // Create dest directory
        if (r.config.dest.length > 0) {
          try {
            fs.mkdirSync(r.config.dest, 0755);
            r.log("Created dest directory : " + fs.realpathSync(r.config.dest));
          } catch(e) {
            r.debug("dest directory already exists : " + r.config.dest);
          }
        }
                    
        // Show config
        r.debug("== Configuration ==");
        for (var p in r.config) {
          r.debug(p.toString() + " : " + r.config[p].toString());
        }
        r.debug("");
      }
    },
    execWithConfig : function(options) {
      r.debug("Exec with config");
      if (r.config.watch === true) {
        r.forEachJs(r.watch);
      } else { 
        // Create a jslint that will exit the whole process on error
        var jslint = function(file) {
          r.jslint(file, {onError:function() {process.exit(1);}});
        }
                
        r.emptyAggregate();
        r.forEachJs(jslint);
        r.forEachJs(r.shipToDest, {onEnd : options.onEnd});
      }
    },
    forEachJs : function eachJs(callback, options) {
      options = options || {};
      
      var dir = r.absPath(r.config.src);
      var files = fs.readdirSync(dir);

      for (var i = 0; i < files.length; i++) {
        var filename = files[i];

        filename = fs.realpathSync(dir + filename);
        var aggTo = fs.realpathSync(r.config.aggregateTo);

        if (filename != aggTo) {
          // If .js
          if (filename.match(/\.js$/i)) {
            // Make sure it's not a compiled file
            var reMin = new RegExp(["\.", r.config.minifiedExtension, "\.js"].join(""));
            if (!filename.match(reMin)) {
              callback(filename);
            } else {
              r.debug("Don't run : " + filename);
            }
          }
        } else {
          r.debug("Aggregate file : " + aggTo);
        }
      }
      if (options.onEnd) { options.onEnd(); }
    },
    // Empty the aggregated file
    emptyAggregate : function() {
      var path = r.absPath() + r.config.aggregateTo;
      
      try {
        var fd = fs.openSync(path, "w");
        fs.truncateSync(fd, 0);
        fs.closeSync(fd);
        r.log("Truncated " + path);
      } catch(e) {
        r.debug("Couldn't truncate the aggregate because file doesn't exist");
      }
    },
    // Write to aggregated file
    writeToAggregate : function(file, code) {
      var path = r.absPath() + r.config.aggregateTo;
      r.log("Aggregate " + file + " to " + path);
      
      var filename = file.match(/[^/]+$/i)[0];

      var fd = fs.openSync(path, "a+");
      fs.writeSync(fd, "/* " + filename + " */\n");
      fs.writeSync(fd, code);
      fs.writeSync(fd, "\n");
      fs.closeSync(fd);
    },
    absPath : function(relativePath) {
      relativePath = relativePath || "";
      var path = fs.realpathSync(r.wd + relativePath).toString();
      if (!path.match(/\/$/)) { path = path + "/"; }
      return path;
    },
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
    shouldAggregate : function() {
      return r.config.aggregateTo.length > 0;
    },
    // Ships all files (compiled or not) to destination
    shipToDest : function(file) {
      // Check if we have to process the file
      if (r.config.runGCompiler || r.shouldAggregate) {
        if (r.config.runGCompiler) {
          r.compile(file, {onSuccess : r.writeToAggregate});
        } else {
          var code = fs.readFileSync(file).toString();
          r.writeToAggregate(file, code);
        }
      }
    },
    /******* PUBLIC *******/
    compile : function(file, options) {
      if (r.config.runGCompiler !== true) { return; }
      
      options = options || {};
      
      var rest = require(__dirname + "/vendor/restler/lib/restler");

      var http = require('http');
      var google = http.createClient(80, 'http://closure-compiler.appspot.com/compile');
      
      var code = fs.readFileSync(file).toString();

      var params = {"js_code" : code, 
        "compilation_level" : "SIMPLE_OPTIMIZATIONS", 
        "output_format" : "text",
        "output_info" : "compiled_code"
      };
      
      rest.post("http://closure-compiler.appspot.com/compile", {data : params})
        .addListener('complete', function(data) {        
          // Extract filename and add suffix
          var filename = file.match(/[^/]+$/i)[0];
          filename = filename.replace(/\.js$/i, "."+r.config.minifiedExtension+".js");
          
          var path = r.absPath(r.config.dest) + filename;
          
          r.debug("Write compiled file to " + path);
          fs.writeFileSync(path, data);
          
          // Call onSuccess
          if (options.onSuccess) {
            options.onSuccess(path, data);
          }
        });
    },
    jslint : function(file, options) {
      options = options || {};
      
      if (r.config.runJsLint !== true) { return; }
    
      var jslintPath = fs.realpathSync(__dirname + "/vendor/jslint/bin/jslint.js");
      
      // Run jslint on each file
      var jslint = cp.exec("node " + jslintPath + " " + file, function(error, stdout, stderr) {
        if (error) {
          r.debug("jslint " + file + " : ERROR");
          sys.puts(file + " : " + error);
          
          if (options.onError) { options.onError(); } 
        } else {
          r.debug("jslint " + file + " : OK");
          
          if (options.onSuccess) { options.onSuccess(); }
        }
      });
    },
    watch : function(file) {
      var watch = function() {
        r.log(file + " changed");
        
        // create a jslint that will call compile on success
        var jslint = function() {
          r.jslint(file, {onSuccess : function() {
            r.compile(file);
          }});
        }
        
        jslint();
      };
      
      fs.watchFile(file, watch);
    },
  };

  var execAsCommandLine = function() {
    if (process.argv[2]) {
      r.loadConfig();
      r.execute();
    } 
  }

  r.initWorkingDir(execAsCommandLine);
  
  // Export for node.js
  for (var p in r) {
    exports[p] = r[p];
  }
  
  return r;
})();


