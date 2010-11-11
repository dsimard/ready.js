#!/usr/bin/env node
var r = require("../ready"),
  fs = require("fs"),
  sys = require("sys");

var config = {
  src : "./", // the source dir of js files
  dest : "./compiled", // the destination of your minified files
  compiledExtension : "min", // extension of the minified file
  runJslint : true, // if should run jsLint
  runGCompiler : true, // if should run GoogleCompiler
  keepCompiled : false, // if should keep the minified files
  aggregateTo : "", // If a string is specified, all the .js will be aggregated to this file in the config.dest      
  order : [], // The order of aggregation (example : we want jquery before jquery.ui) Must not specified every file.
  exclude : [], // Files that are not compiled but still aggregated
  test : false, // If it's running from test environment
  debug : false, // If in debug mode
}

var allJsFiles = [];
var aggregates = [];

var logger = {
  debug : function(msg) {
    if (config.debug === true) {
      console.log(msg);
      for (var i = 1, arg; arg = arguments[i]; i++) {
        console.log(sys.inspect(arg));
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
  },
}

function loadConfig(extConfig) {
  extConfig = extConfig || {};
  
  // Extend config file
  for (var p in config) {
    config[p] = typeof(extConfig[p]) === "undefined" ? config[p] : extConfig[p];
  }

  // Minified extension must be letters or numbers
  if (config.runGCompiler && !config.compiledExtension.match(/^[0-9a-zA-Z]+$/)) {
    logger.log("config.minifiedExtension is not valid. Using 'min' as default value.");
    config.minifiedExtension = 'min';
  }
        
  // src and dest must be different
  if (config.src == config.dest) {
    var src = config.src;
    src = config.src + (config.src.match(/\/$/) ? "" : "/");
    config.dest = src + "minified/"
    logger.log("config.src and config.dest must be different. Using '"+config.dest
      +"' as default value for config.dest.");          
  }
                
  // Show config
  logger.debug("== Configuration ==");
  for (var p in config) {
    logger.debug(p.toString() + " : " + config[p].toString());
  }
}

// Run through all js
function forEachJs(callback) {
  fs.readdir(config.src, function(err, files) {
    if (!err) {
      // Sort the files if there's a specified order
      allJsFiles = files.filter(function(f) {
        // It it's a js
        return f.match(/\.js$/i);
      }).map(function(f) {
        return fs.realpathSync(config.src + "/" + f);
      });
      
      // For each file, callback
      allJsFiles.forEach(function(f, i) {
        callback(f);
      });
      
    } else {
      logger.warn("No files to process");
    }
  });
}

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

// If a file is excluded
function isExcluded(file) {
  if (typeof(config.exclude) == "string") { config.exclude = [config.exclude]; }
  var filename = file.substring(file.lastIndexOf("/")+1);
  return config.exclude.indexOf(filename) >= 0
}

function compile(file, callback) {
  if (config.runGCompiler && !isExcluded(file)) {
    r.compile(file, function(success, code, data) {
      if (success) {
        callback(file, code);
      } else {
        console.log("Error on compile : " + sys.inspect(data));
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
  
  aggregates.push({filename : filename, code : code});
  
  var end = function() {
    if (allJsFiles.length == aggregates.length) { aggregateAll(); }
  }  

  // Save the file to dest
  if (config.keepCompiled) {
    var minfilename = filename.replace(/\.js$/i, "."+config.compiledExtension+".js");
    // Create dest
    fs.mkdir(config.dest, 0755, function() {
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
    var code = aggregates
      .sort(sortAggregates)
      .reduce(function(a, b) {
        if (typeof(a) !== "string") { a = createCode(a); };
        b = createCode(b);
        return [a, b].join("\n");
      });
  
    // Write aggregate file
    var filepath = config.dest + "/" + config.aggregateTo;
    fs.open(filepath, "w", 0755, function(err, fd) {
      if (!err) {
        fs.write(fd, code, null, null, function(err) {
          fs.close(fd);
        });
      } else {
        logger.error("Can't write aggregate file");
      }
    });
  }
}

// Load the config file
if (process.argv[2]) {
  // Read the config file
  fs.readFile(process.argv[2], function(err, text) {
    var conf = JSON.stringify({});
    if (err) {
      conf = JSON.parse(process.argv[2]);
    } else {
      conf = text.toString();
    }

    // Put values in variable
    process.compile('var extConfig = ' + conf, "config_file.js");
    loadConfig(extConfig);
    
    // Start the process
    forEachJs(function(file) {
      if (config.runJslint && !isExcluded(file)) {
        // Run jslint
        r.jslint(file, function(success, jslint) {
          if (success) {
            logger.log("JSLINT success : " + file);
            compile(file, aggregate);
          } else {
            console.log("Error on jslint : " + sys.inspect(jslint));
          }
        });
      } else {
        compile(file, aggregate);
      }
    });
  }); 
} else {
  logger.error("No configuration file specified");
}

