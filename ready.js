var sys = require("sys"),
    fs = require("fs"),
    cp = require('child_process'),
    jslint = require(__dirname + "/vendor/jslint/lib/fulljslint_export").JSLINT,
    rest = require(__dirname + "/vendor/restler/lib/restler");

var r = {
  test : false, // If in test
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
  // Compile the code
  compile : function(fileOrCode, callback) {
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
      
      if (r.test) {
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
  jslint : function(fileOrCode, callback) {
    r.getCode(fileOrCode, function(code) {
      var success = jslint(code);
      callback(success, jslint);
    });
  },
  // Watch a file
  watch : function(file, callback) {
    r.jslint(file, callback);
    fs.watchFile(file, function() {r.jslint(file, callback);});
  },
};

module.exports = r;


