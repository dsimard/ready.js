var sys = require("util"),
    fs = require("fs"),
    cp = require('child_process'),
    rest = require("../node_modules/restler"),
    jslint = require("../node_modules/jslint/lib/nodelint"),
    path = require("path"),
    config = require("./config"),
    logger = require("./logger"),
    uglify = require("uglify-js"),
    jsp = uglify.parser,
    pro = uglify.uglify,
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
  // Compile the code
  compile : function(file, callback) {
    r.getCode(file, function(code) {
      try {
        var ast = jsp.parse(code);
        ast = pro.ast_mangle(ast);
        ast = pro.ast_squeeze(ast);
        var compiledCode = pro.gen_code(ast);
        
        callback(true, compiledCode);
      } catch(e) {
        logger.info(inspect(e));
        logger.error("Compile error for '" + file + "'");
      }
      
    });
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


