var sys = require("sys"),
    fs = require("fs"),
    cp = require('child_process'),
    jslint = require(__dirname + "/vendor/jslint/lib/fulljslint_export").JSLINT,
    rest = require(__dirname + "/vendor/restler/lib/restler");
    
var r = {
  // Returns an absolute path
  absPath : function(relativePath) {
    relativePath = relativePath || "";
    var path = fs.realpathSync(r.wd + relativePath).toString();
    if (!path.match(/\/$/)) { path = path + "/"; }
    return path;
  },
  // Ships all files (compiled or not) to destination
  shipToDest : function(file) {
    var writeToAgg = function(file, code) {
      r.writeToAggregate(file, code);
    }
    
    // Check if we have to process the file
    if (r.config.runGCompiler || r.shouldAggregate) {
      if (r.config.runGCompiler) {
        r.compile(file, {onSuccess : writeToAgg});
      } else {
        var code = fs.readFileSync(file).toString();
        writeToAgg(file, code);
      }
    }
    
    if (options.onEnd) { options.onEnd(); }
  },
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
  /******* PUBLIC *******/
  // Compile the code
  compile : function(fileOrCode, callback) {
    r.getCode(fileOrCode, function(code) {
      // Don't send to google compiler in test
      var params = {"js_code" : code, 
        "compilation_level" : "SIMPLE_OPTIMIZATIONS", 
        "output_format" : "json",
        "output_info" : "compiled_code"
      };
        
      rest.post("http://closure-compiler.appspot.com/compile", {data : params})
        .addListener('complete', function(data) {
          data = JSON.parse(data);
          callback(data.compiledCode.length > 0, data.compiledCode, data);
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

// Export for node.js
for (var p in r) {
  exports[p] = r[p];
}


