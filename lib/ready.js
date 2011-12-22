var sys = require("util"),
    fs = require("fs"),
    cp = require('child_process'),
    rest = require("../node_modules/restler"),
    jslint = require("../node_modules/readyjslint").JSLINT,
    path = require("path"),
    config = require("./config"),
    logger = require("./logger"),
    inspect = require("util").inspect;

var r = {
  // Get the code from fileOrCode
  getCode : function(fileOrCode, callback) {
    // Check if it's a file or code
    if (!fileOrCode.match(/\n/g)) {
      fs.readFile(fileOrCode, function(err, data) {
        callback(err ? fileOrCode : data.toString());
      });
    } else {
      callback(fileOrCode);
    }
  },
  // Look for offline compiler 
  searchOfflineCompiler : function(callback) {
    var compiler = path.join(__dirname, "../../../compiler.jar");
    path.exists(compiler, function(exists) {
      if (exists) {
        callback(compiler);
      } else {
        compiler = path.join(__dirname, "../vendor/compiler.jar");
        path.exists(compiler, function(exists) {
          if (exists) {
            callback(compiler);
          } else {
            callback();
          }
        });
      }
    });
  },
  // Compile the code
  compile : function(fileOrCode, callback) {
    // Check if there's an offline compiler
    r.searchOfflineCompiler(function(compilerPath) {
      if (compilerPath) {
        r.compileOffline(compilerPath, fileOrCode, callback);
      } else {
        r.compileOnline(fileOrCode, callback);
      }
    });
  },
  // Compile offline
  compileOffline : function(compilerPath, file, callback) {
    var cmd = ["java", "-jar", compilerPath, "--js", file].join(" ");
    
    cp.exec(cmd, function(err, stdout, stderr) {
      if (err) {
        logger.warn("Could not compile " + file);
        logger.error(stderr);
      } else {
        r.compileCompleted(null, stdout, callback);
      }          
    }); 
  },
  // Compile online
  compileOnline : function(fileOrCode, callback) {
    r.getCode(fileOrCode, function(code) {
      // Don't send to google compiler in test
      var params = {"js_code" : code, 
        "compilation_level" : "SIMPLE_OPTIMIZATIONS", 
        "output_format" : "json",
        "output_info" : "compiled_code"
      };
      
      var completed = function(data) {
        r.compileCompleted(data, code, callback);
      }
      
      if (config.test) {
        completed();
      } else {
        var url = "http://closure-compiler.appspot.com/compile";
        rest.post(url, {data : params}).addListener('complete', completed);
      }
    });    
  },
  // On compile completed
  compileCompleted : function(data, code, callback) {
    var newData = {compiledCode : code};
    
    if (data) { newData = JSON.parse(data); }
    
    var success = newData.compiledCode && newData.compiledCode.length > 0 && !newData.serverErrors;
    callback(success, newData.compiledCode, newData);
  },
  // Check with jslint
  jslint : function(fileOrCode, callback, options) {
    r.getCode(fileOrCode, function(code) {
      var success = jslint(code, options);
      callback(success, jslint);
    });
  },
  // Watch a file
  watch : function(file, callback) {
    r.jslint(file, callback);
    fs.watchFile(file, function() {r.jslint(file, callback);});
  }
};

module.exports = r;


