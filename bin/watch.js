#!/usr/bin/env node
var r = require("../lib/ready"),
  fs = require("fs"),
  sys = require("sys"),
  util = require("../lib/utils"),
  logger = require("../lib/logger");

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
  
if (process.argv[2]) {
  util.loadConfigFromArg(watchFiles);
} else {
  logger.error("No configuration file specified");
}

