var inspect = require("util").inspect,
  argv = require("../node_modules/optimist"),
  colors = require("../node_modules/colors");
  

module.exports = {
  debug : function(msg) {
    if (argv.debug) {
      for (var i = 1, arg; arg = arguments[i]; i++) {
        console.log(inspect(arg));
      }
    }
  },
  warn : function(msg) {
    console.log(("WARNING : " + msg).yellow);
  },
  info : function(msg) {
    console.log(msg.blue);
  },
  log : function(msg) {
    console.log(msg);
  },
  error : function(msg) {
    console.log(("ERROR : " + msg).red);
    process.exit(1);
  },
}
