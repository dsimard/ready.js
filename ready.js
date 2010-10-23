Readyjs = (function() {
  var sys = require("sys");
  var fs = require("fs");
  var cp = require('child_process');
  
  var r = {
    /******* PROPERTIES *******/
    wd : "",
    config : {
      src : "./", // the source dir of js files
      dest : "./", // the destination where to put them
      debug : false, // if debug mode
      minifiedExtension : "min", // Extension of the minified file
    },
    /******* PRIVATE *******/
    load : function() {
      r.initWorkingDir(r.execWithArgs);
    },
    initWorkingDir : function(cb) {
      // Get the working dir
      cp.exec("git rev-parse --show-cdup", function(error, stdout, stderr) {
        stdout = stdout.toString().replace(/\s*$/, "")
        r.wd = fs.realpathSync(stdout.toString());
        if (cb) { cb() };
      });
    },
    loadConfig : function() {
      // If the arg is a file, use it as config file. Else, load directly
      var arg = process.argv[2];
      var isFile = null;
      try {
        isFile = fs.statSync(arg).isFile();
      } catch(err) {
      }

      var confJson = arg;

      if (isFile === true) {
        code = fs.readFileSync(arg).toString();
      } 
      
      // Put values in variable
      process.compile('var config = ' + code, "execWithArgs.js");

      // Extend config file
      for (var p in r.config) {
        r.config[p] = (config && config[p]) || r.config[p];
      }
      
      // Show config
      for (var p in r.config) {
        r.debug("config " + p.toString() + " : " + r.config[p].toString());
      }
    },
    execWithArgs : function() {
      if (process.argv && process.argv[2]) {
        r.for_each_js(r.jslint);
        r.for_each_js(r.compress);
      }
    },
    for_each_js : function(callback) {
      var dir = r.absPath(r.config.src);
      var files = fs.readdirSync(dir);

      for (var i = 0; i < files.length; i++) {
        var filename = files[i];
        
        // If .js
        if (filename.match(/\.js$/i)) {
          var complete = dir + filename;
          callback(complete);
        }
      }
    },
    absPath : function(relativePath) {
      var path = fs.realpathSync(r.wd + relativePath).toString();
      if (!path.match(/\/$/)) { path = path + "/"; }
      return path;
    },
    debug : function(msg) {
      if (r.config.debug === true) {
        console.log(msg);
      }
    },
    /******* PUBLIC *******/
    compress : function compress(file) {
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
          var filename = file.match(/[^/]+$/i)[0];
          filename = filename.replace(/\.js$/i, "."+r.config.minifiedExtension+".js");
          var path = r.absPath(r.config.dest) + filename;
          r.debug("Write compressed file to " + path);
          fs.writeFileSync(path, data);
        });
    },
    jslint : function(file) {
      var jslintPath = fs.realpathSync(__dirname + "/vendor/jslint/bin/jslint.js");
      
      // Run jslint on each file
      var jslint = cp.exec("node " + jslintPath + " " + file, function(error, stdout, stderr) {
        if (error) {
          r.debug("jslint " + file + " : ERROR");
          sys.puts(file + " : " + error);
        } else {
          r.debug("jslint " + file + " : OK");
        }
      });
    }
  };

  r.loadConfig();
  r.load();
  
  return r;
})();



