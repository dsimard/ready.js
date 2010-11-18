#!/usr/bin/env node
var r = require(__dirname + "/../ready"),
  fs = require("fs"),
  sys = require("sys"),
  util = require(__dirname + "/ready_utils"),
  config = util.config,
  logger = util.logger;

var aggregates = [];

function sortAggregates(a, b) {
  a = a.filename;
  b = b.filename;
  
  var posA = config.order.indexOf(a);
  if (posA < 0) { posA = Number.MAX_VALUE };
  
  var posB = config.order.indexOf(b);
  if (posB < 0) { posB = Number.MAX_VALUE };
  
  if (posA == posB) {
    return (a < b) ? -1 : ((a > b) ? 1 : 0);
  } else {
    return posA - posB;
  }         
}

function compile(file, callback) {
  if (config.runGCompiler && !util.isExcluded(file)) {
    r.compile(file, function(success, code, data) {
      if (success) {
        callback(file, code);
      } else {
        if (data.compiledCode !== null) {
          console.log("Error compiling '" + file + "' : code does not seem valid.");
        } else {
          console.log("Error compiling '" + file + "' : " + sys.inspect(data));
        }
      }
    });
  } else {
    // Get the code directly from the file
    fs.readFile(file, function(err, text) {
      if (!err) {
        callback(file, text.toString());
      } else {
        r.log("Error reading file : " + file);
      }
    });
  }
}

function aggregate(file, code) {
  var filename = file.match(/[^\/]+$/g)[0];
  var minfilename = filename.replace(/\.js$/i, "."+config.compiledExtension+".js");
  
  aggregates.push({filename : filename, code : code});
  
  var end = function() {
    if (util.allJsFiles.length == aggregates.length) { aggregateAll(); }
  }  

  // Save the file to dest
  if (config.keepCompiled) {
    // Create dest
    fs.mkdir(config.dest, 0755, function(err) {
      fs.open(config.dest + "/" + minfilename, "w+", 0755, function(err, fd) {
        if (!err) {
          fs.write(fd, code, null, null, function(err, written) {
            if (err) {
              logger.error("Can't write compiled file : " + minfilename);
            }

            end();
            fs.close(fd);
          });
        } else {
          logger.error("Can't save compiled file : " + minfilename);
          end();
        }
      });
    });
  } else {
    end();
  }
}

// Aggregate all
function aggregateAll() {
  if (config.aggregateTo.length > 0) {
    var createCode = function(agg) {
      return [["/*", agg.filename, "*/"].join(" "), agg.code].join("\n");
    }

    // Sort by the order
    aggregates = aggregates.sort(sortAggregates);
    var code = 
      aggregates.reduce(function(a, b) {
        if (typeof(a) !== "string") { a = createCode(a); };
        b = createCode(b);
        return [a, b].join("\n");
      });
  
    // Write aggregate file
    fs.mkdir(config.dest, 0755, function(err) {
      var filepath = config.dest + "/" + config.aggregateTo;
      fs.open(filepath, "w+", 0755, function(err, fd) {
        if (!err) {
          fs.write(fd, code, null, null, function(err) {
            fs.close(fd);
          });
        } else {
          logger.error("Can't write aggregate file");
        }
      });
    });
  }
}

// Load the config file
if (process.argv[2]) {
  var startProcessing = function() {
    r.test = config.test; // If in test
    
    // Start the process
    util.forEachJs(function(file) {
      if (config.runJslint && !util.isExcluded(file)) {
        // Run jslint
        r.jslint(file, function(success, jslint) {
          if (success) {
            logger.log("JSLINT success : " + file);
            compile(file, aggregate);
          } else {
            log.error("Error on jslint : " + sys.inspect(jslint));
          }
        });
      } else {
        compile(file, aggregate);
      }
    });
  };

  util.loadConfigFromArg(startProcessing);
  
} else {
  logger.error("No configuration file specified");
}

