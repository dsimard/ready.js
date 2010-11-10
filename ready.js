var sys = require("sys"),
    fs = require("fs"),
    cp = require('child_process'),
    jslint = require(__dirname + "/vendor/jslint/lib/fulljslint_export").JSLINT,
    rest = require(__dirname + "/vendor/restler/lib/restler");
    
var r = {
  // Empty the aggregated file
  emptyAggregate : function() {
    if (r.shouldAggregate()) {
      var path = r.absPath(r.config.dest) + r.config.aggregateTo;

      try {
        var fd = fs.openSync(path, "w");
        fs.truncateSync(fd, 0);
        fs.closeSync(fd);
        r.log("Truncated " + path);
      } catch(e) {
        r.debug("Couldn't truncate the aggregate because file doesn't exist");
      }
    }
  },
  // Write to aggregated file
  writeToAggregate : function(file, code) {
    if (r.shouldAggregate()) {
      var path = r.absPath(r.config.dest) + r.config.aggregateTo;
      r.log("Aggregate " + file + " to " + path);
      
      var filename = file.match(/[^/]+$/i)[0];

      var fd = fs.openSync(path, "a+");
      fs.writeSync(fd, "/* " + filename + " */\n");
      fs.writeSync(fd, code);
      fs.writeSync(fd, "\n");
      fs.closeSync(fd);
    }
  },
  // Returns an absolute path
  absPath : function(relativePath) {
    relativePath = relativePath || "";
    var path = fs.realpathSync(r.wd + relativePath).toString();
    if (!path.match(/\/$/)) { path = path + "/"; }
    return path;
  },
  // If it should aggregate the files
  shouldAggregate : function() {
    return r.config.aggregateTo.length > 0;
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
  // Sort the files before processing them
  sortFiles : function(a, b) {
    var posA = r.config.order.indexOf(a);
    if (posA < 0) { posA = Number.MAX_VALUE };
    
    var posB = r.config.order.indexOf(b);
    if (posB < 0) { posB = Number.MAX_VALUE };
    
    if (posA == posB) {
      return (a < b) ? -1 : ((a > b) ? 1 : 0);
    } else {
      return posA - posB;
    }         
  },
  // If a file is excluded
  isExcluded : function(file) {
    if (typeof(r.config.exclude) == "string") { r.config.exclude = [r.config.exclude]; }
    var filename = file.substring(file.lastIndexOf("/")+1);
    return r.config.exclude.indexOf(filename) >= 0
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
  /** LOGGER **/
  debug : function(msg) {
    if (r.config.logToConsole && r.config.debug === true) {
      console.log(msg);
      for (var i = 1, arg; arg = arguments[i]; i++) {
        console.log(sys.inspect(arg));
      }
    }
  },
  warn : function(msg) {
    if (r.config.logToConsole) {
      console.log("WARNING : " + msg);
    }
  },
  log : function(msg) {
    if (r.config.logToConsole) {
      console.log(msg);
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
          callback(data);
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


