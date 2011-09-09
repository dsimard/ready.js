var inspect = require("util").inspect,
  config = require("../lib/config");

module.exports = {
  debug : function(msg) {
    if (config.debug) {
      for (var i = 1, arg; arg = arguments[i]; i++) {
        console.log(inspect(arg));
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
}
