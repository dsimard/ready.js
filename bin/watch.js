#!/usr/bin/env node
var r = require("../lib/ready"),
  fs = require("fs"),
  sys = require("sys"),
  util = require("../lib/utils"),
  logger = require("../lib/logger"),
  argv = require('optimist').argv;

function watchFiles() {
  util.forEachJs(function(file) {
    if (!util.isExcluded(file)) {
      r.watch(file, function(success, jslint) {
        if (success) {
          logger.log("JSLint on '" + file + "' : OK");
        } else {
          logger.log("JSLint error on '" + file + "'");
          util.showJslintErrors(jslint);
        }
      });
    }
  });
}
  
if (argv.length == 0) {
  var msg = ["\nusage : readyjs [path/to/config] - see : http://j.mp/readyjsconfig",
    "-i, --installcompiler path/to/compiler.jar : install google closure compiler for offline compilation",
    "-s, --src path/to/js : the path of the source of javascript files",
    "-d, --dest path/to/dest : the destination of the compiled javascript files",
    "\n"].join("\n \n");
  logger.log(msg)
} else if (argv.v || argv.version) {
  util.version();
}

