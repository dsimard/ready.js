#!/usr/bin/env node
var r = require(__dirname + "/../ready"),
  fs = require("fs"),
  sys = require("sys"),
  util = require(__dirname + "/ready_utils"),
  config = util.config,
  logger = util.logger;

var aggregates = [];
var aggregatesCss = [];

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

function sortAggregatesCss(a, b) {
  a = a.filename;
  b = b.filename;
  
  var posA = config.orderCss.indexOf(a);
  if (posA < 0) { posA = Number.MAX_VALUE };
  
  var posB = config.orderCss.indexOf(b);
  if (posB < 0) { posB = Number.MAX_VALUE };
  
  if (posA == posB) {
    return (a < b) ? -1 : ((a > b) ? 1 : 0);
  } else {
    return posA - posB;
  }         
}

function compile(file, callback, type) {
  var type = type || 'js';
  var compileCallback = function(success, code, data) {
      if (success) {
        callback(file, code);
      } else {
        if (data.compiledCode !== null) {
          console.log("Error compiling '" + file + "' : code does not seem valid.");
        } else {
          console.log("Error compiling '" + file + "' : " + sys.inspect(data));
        }
      }
  }
  
  if(!util.isIgnored(file, type)){
	  if ( type == 'js' && config.compileJs && !util.isExcluded(file) ) {
		logger.log('Compiling JS: ' + file);
		// prefer YUI as it is local and has no usage limits
		if(config.runGCompiler){
		  logger.log('...using remote Google Compiler')
	      r.compile(file, compileCallback);
		}else{
		  logger.log('...using YUI');
		  r.compileYUI(file, compileCallback);
		}
		logger.log('');
	  } else if ( type == 'css' && config.compileCss && !util.isExcluded(file, 'css')  ) {
		logger.log('Compiling CSS: ' + file);
		logger.log('');
		r.compileYUI(file, compileCallback, 'css');
	  } else {
		if( (type == 'css' && config.compileCss ) || (type == 'js' && config.compileJs ) ){
			logger.log('Skipping compression: ' + file)
		    // Get the code directly from the file
		    fs.readFile(file, function(err, text) {
		      if (!err) {
		        callback(file, text.toString());
		      } else {
		        r.log("Error reading file : " + file);
		      }
		    });
			logger.log('');
		}
	  }
  }else{
	  logger.log('Ignoring: ' + file);
	  logger.log('');
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

function aggregateCss(file, code) {
  var filename = file.match(/[^\/]+$/g)[0];
  var minfilename = filename.replace(/\.css$/i, "."+config.compiledExtension+".css");
  
  aggregatesCss.push({filename : filename, code : code});
  
  var end = function() {
    if (util.allCssFiles.length == aggregatesCss.length) { aggregateAll('css'); }
  }  

  // Save the file to dest
  if (config.keepCompiled) {
    // Create dest
    fs.mkdir(config.destCss, 0755, function(err) {
      fs.open(config.destCss + "/" + minfilename, "w+", 0755, function(err, fd) {
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
function aggregateAll(type) {
  var type = type || 'js',
  aggTo,
  aggs,
  dest,
  sort;
  
  if(type == 'js'){
  	aggTo = config.aggregateTo;
    aggs = aggregates;
    dest = config.dest;
    comment = config.aggregatedHeadingComment;
    sort = sortAggregates;
  }else{
	aggTo = config.aggregateToCss;
    aggs = aggregatesCss;
    dest = config.destCss;
    comment = config.aggregatedHeadingCommentCss;
	sort = sortAggregatesCss;
  }
  
  if (aggTo.length > 0) {
    var createCode = function(agg) {
      return [["/*", agg.filename, "*/"].join(" "), agg.code].join("\n");
    }
	
    // Sort by the order
    aggs = aggs.sort(sort);
    var code = 
      aggs.reduce(function(a, b) {
        if (typeof(a) !== "string") { a = createCode(a); };
        b = createCode(b);
        return [a, b].join("\n");
      });
    if (typeof(code) !== "string") { code = createCode(code); }

    // Write aggregate file	
    fs.mkdir(dest, 0755, function(err) {
      var filepath = dest + "/" + aggTo;
	  logger.log('');
	  logger.log('Aggregating ' + type.toUpperCase() + ' to: ' + filepath);
	  logger.log('');
      fs.open(filepath, "w+", 0755, function(err, fd) {
        if (!err) {
          fs.write(fd, createCode({ code: code, filename: comment}), null, null, function(err) {
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
    
    // Start the process for js
    util.forEachJs(function(file) {
      if (config.runJslint && !util.isExcluded(file) && !util.isIgnored(file)) {
        // Run jslint
        r.jslint(file, function(success, jslint) {
          if (success) {
            logger.log("JSLINT success : " + file);
			logger.log('');
            compile(file, aggregate);
          } else {
            logger.log("JSLINT error : " + file);
            util.showJslintErrors(jslint);
            process.exit(1);
          }
        });
      } else {
       compile(file, aggregate);
      }
    });
	
	// Start the process for css
    util.forEachCss(function(file) {
	  compile(file, aggregateCss, 'css');
    });
  };

  util.loadConfigFromArg(startProcessing);
  
} else {
  logger.error("No configuration file specified");
}

