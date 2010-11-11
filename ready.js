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
      
      var url = r.test ? "http://www.azanka.ca" : "http://closure-compiler.appspot.com/compile";
      if (r.test) { params = {} } ;
      rest.post(url, {data : params})
        .addListener('complete', function(data) {

          var newData = {compiledCode : code};
          if (!r.test) { newData = JSON.parse(data); }

          callback(newData.compiledCode.length > 0, newData.compiledCode, newData);
        });
    });
  },
  // Check with jslint
  jslint : function(fileOrCode, callback) {
    r.getCode(fileOrCode, function(code) {
      var success = jslint(code);
      callback(success, jslint);
    });
  },
  // Watch a file
  watch : function(file) {
    var watch = function() {
      jslint(file);
    };

    fs.watchFile(file, jslint(file));
  },
};

module.exports = r;


