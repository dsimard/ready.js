var fs = require("fs"),
  sys = require("util"),
  u = require("util"),
  path = require("path"),
  config = require("./config"),
  logger = require("./logger");
  
var r = {
  allJsFiles : [], // Contains a list of all js
  // Run through all js
  forEachJs : function(callback, dir) {
    dir = dir || config.src;
    dir = path.resolve(dir);

    fs.readdir(dir, function(err, files) {
      if (!err) {
        // Get real path
        files = files.map(function(f) {
          return fs.realpathSync(dir + "/" + f);
        })
      
        // Only process js files
        var jsFiles = files.filter(function(f) {
          return f.match(/\.js$/i);
        });

        // Add files to all files
        r.allJsFiles = r.allJsFiles.concat(jsFiles);
        
        // Check subfolders
        if (config.recursive) {
          // Get the real path of the dest
          fs.realpath(config.dest + "/", function(err, destPath) {
            files.forEach(function(f) {
              fs.stat(f, function(err, stats) {
                if (stats.isDirectory()) {
                  // Check that dest and this path are not the same
                  fs.realpath(f + "/", function(err, currentPath) {
                    if (currentPath != destPath) {
                      r.forEachJs(callback, f);
                    }
                  });
                }
              });
            });
          });
        }
        
        // For each file, callback
        jsFiles.forEach(function(f, i) {
          callback(f);
        });
        
      } else {
        logger.warn("No files to process");
      }
    });
  },
  // If a file is excluded
  isExcluded : function(file) {
    if (typeof(config.exclude) == "string") { config.exclude = [config.exclude]; }
    var filename = file.substring(file.lastIndexOf("/")+1);
    return config.exclude.indexOf(filename) >= 0
  },
  // Show formated jslint errors
  showJslintErrors : function (jslint) {
    jslint.errors.reverse().forEach(function(e) {
      if (e) {
        logger.log([e.line.toString(), ",", e.character.toString(), " : ",
          (e.evidence || "").replace(/^\s*|\s*$/g, ""), " ===> ", e.reason].join(""));
      }
    });
  },
  // Install compiler.jar
  installCompiler : function(compilerPath) {  
    // Check if exists
    fs.stat(compilerPath, function(err, stats) {
      if (!err && stats.isFile()) {
        // Check if .npm(v0.x) node_modules(v1.x)
        if (__dirname.match(/(\.npm|node_modules)/)) {
          var installPath = path.join(__dirname, '../../../compiler.jar');
          var is = fs.createReadStream(compilerPath)
          var os = fs.createWriteStream(installPath);
          u.pump(is, os, function() {
            logger.log("Compiler successfully installed to '" + installPath + "'");
          });
        } else {
          logger.error("Installing a compiler is available only with a NPM installation. Run `npm install ready`.");
        }
      } else {
        logger.error(["'", path, "' is not valid file for a compiler"].join(""));
      }
    });
  },
  // Return the version
  version : function() {
    fs.readFile(path.join(__dirname, "../", "package.json"), function(err, code) {
      if (err) {
        logger.error("Can't read package.json");
      } else {
        var package = JSON.parse(code.toString());
        logger.log(package.version);
      }
    });
  },
  // Show usage.txt
  usage : function() {
    fs.readFile(path.join(__dirname, "usage.txt"), function(err, txt) {
      if (err) {
        logger.error("This is really wrong, you should have a usage.txt file.");
      } else {
        logger.log(txt.toString());
      }
    });
  }
}

module.exports = r;
