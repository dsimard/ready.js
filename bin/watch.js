#!/usr/bin/env node
var r = require(__dirname + "/../ready"),
  fs = require("fs"),
  sys = require("sys"),
  util = require(__dirname + "/ready_utils"),
  logger = util.logger;

function showErrors(jslint) {
  jslint.errors.reverse().forEach(function(e) {
    if (e) {
      logger.log([e.line.toString(), ",", e.character.toString(), " : ",
        (e.evidence || "").replace(/^\s*|\s*$/g, ""), " ===> ", e.reason].join(""));
    }
  });
}

function watchFiles() {
  util.forEachJs(function(file) {
    if (!util.isExcluded(file)) {
      r.watch(file, function(success, jslint) {
        if (success) {
          logger.log("JSLint on '" + file + "' : OK");
        } else {
          logger.log("JSLint error on '" + file + "'");
          showErrors(jslint);
        }
      });
    }
  });
}
  
if (process.argv[2]) {
  util.loadConfigFromArg(watchFiles);
}

