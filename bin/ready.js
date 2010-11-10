#!/usr/bin/env node
r = require("../ready"),
log = require("../vendor/logging/lib/logging").from(__filename);

var config = {
  src : "./", // the source dir of js files
  dest : "./compiled", // the destination of your minified files
  minifiedExtension : "min", // extension of the minified file
  runJsLint : true, // if should run jsLint
  runGCompiler : true, // if should run GoogleCompiler
  keepMinified : false, // if should keep the minified files
  aggregateTo : "", // If a string is specified, all the .js will be aggregated to this file in the config.dest      
  order : [], // The order of aggregation (example : we want jquery before jquery.ui) Must not specified every file.
  exclude : [], // Files that are not compiled but still aggregated
  test : false, // If it's running from test environment
}

function loadConfig(config) {
  config |= {};

  // Extend config file
  for (var p in r.config) {
    r.config[p] = typeof(config[p]) === "undefined" ? r.config[p] : config[p];
  }

  // Minified extension must be letters or numbers
  if (r.config.runGCompiler && !r.config.minifiedExtension.match(/^[0-9a-zA-Z]+$/)) {
    r.log("config.minifiedExtension is not valid. Using 'min' as default value.");
    r.config.minifiedExtension = 'min';
  }
        
  // src and dest must be different
  if (r.config.src == r.config.dest) {
    var src = r.config.src;
    src = r.config.src + (r.config.src.match(/\/$/) ? "" : "/");
    r.config.dest = src + "minified/"
    r.log("config.src and config.dest must be different. Using '"+r.config.dest
      +"' as default value for config.dest.");          
  }
                
  // Show config
  r.debug("== Configuration ==");
  for (var p in r.config) {
    r.debug(p.toString() + " : " + r.config[p].toString());
  }
}

// Run through all js
function forEachJs(callback, options) {
  options = options || {};
  
  var dir = r.absPath(r.config.src);
  var files = fs.readdirSync(dir);
  
  // Sort the files if there's a specified order
  files.sort(r.sortFiles);
  
  for (var i = 0; i < files.length; i++) {
    var filename = files[i];
    var last = i == files.length-1;
    
    filename = fs.realpathSync(dir + filename);
    var aggTo = fs.realpathSync(r.absPath(r.config.dest) + r.config.aggregateTo);

    if (filename != aggTo) {
      // If .js
      if (filename.match(/\.js$/i)) {
        // Make sure it's not a compiled file
        callback(filename, {
          onEnd : function() {
            if (last && options.onEnd) { options.onEnd(); }
          }
        });
      }
    } 
  }
}

// Load the config file
if (process.argv[2]) {
} else {
  
}

