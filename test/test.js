#!/usr/bin/env node
var sys = require("util"),
  fs = require("fs"),
  cp = require("child_process");
  a = require("assert"),
  r = require("../lib/ready"),
  path = require("path"),
  colors = require("../node_modules/colors"),
  inspect = require("util").inspect;
  
const SRC = "./test/javascripts/";
const DEST = "./test/minified/";
const ALL = "all.js";

var initialConfig = null;

// Delete all unwanted files
function emptyDir(dir) {
  var isDir = false;
  try {
    isDir = fs.statSync(dir).isDirectory();
  } catch(e) {}
  
  if (isDir) {
    var files = fs.readdirSync(dir);
    files.forEach(function(file) {
      var file = fs.realpathSync(dir + "/" + file);
      if (fs.statSync(file).isDirectory()) {
        emptyDir(file)
      } else {
        fs.unlinkSync(file);
      }
    });
    
    fs.rmdirSync(dir);
  }
  
  return isDir;
}

function cleanUp() {
  // Keep the initial config
  initialConfig = initialConfig || r.config;
  
  // Put back initial config
  r.config = initialConfig;
  
  // Delete conf.js
  fs.unlink(path.join(__dirname, "conf.js"));

  if (emptyDir(DEST, true)) {
    var isDir = false;
    try {
      isDir = fs.statSync(DEST).isDirectory();
    } catch(e) {}

    a.equal(isDir, false);
  }  
  
  emptyDir(SRC);
}

// Create a default config
function getConfig(extend) {
  extend = extend || {};
  
  var c = { src : SRC,
   dest : DEST,
   aggregateTo : ALL,
   test : true,
   debug: true
  };
  
  for (var p in extend) {
    c[p] = extend[p];
  }

  return c;
}

// Create a file
function createFile(path, code, options) {
  options = options || {};

  code = code || ["function load() {} // not compiled"].join("");

  // Create the SRC directory if not exists
  var isDir = false;
  try {
    isDir = fs.statSync(SRC).isDirectory();
  } catch(e) {}
    
  if (!isDir) {
    fs.mkdirSync(SRC, 0755);
  }
  
  // If there's a subdir, create it
  if (options.subdir) {
    try {
      fs.mkdirSync(SRC + options.subdir, 0755);
    } catch(e) {}
  }

  var dir = SRC;
  dir += options.subdir ? options.subdir + "/" : "";

  var fd = fs.openSync(dir + path, "w+", 0755)
  fs.writeSync(fd, code);
  fs.closeSync(fd);
}

// Creates 2 js files
function createTwoFiles() {
  createFile("js.js");
  createFile("js2.js");
}

// Creates bad file
function createBadFile() {
  createFile("bad.js", "{(}");
}

// Create 3 alphabetical files
function createAlphaFiles() {
  createFile("c.js");
  createFile("b.js");
  createFile("a.js");
}

// Create with a subdir
function createSubdir() {
  createTwoFiles();
  createFile("subdir.js", "function subdir() {}", {subdir:"subdir"});
}

// Execute a ready.js
function execNoConfig(argv, callback) {
  return execArgv(null, argv, callback);
}

function exec(config, callback) {
  config = config || getConfig();
  return execArgv(config, null, callback);
}

function execArgv(config, argv, callback) {
  argv = argv || "";
  
  if (config && typeof(config) != "string") {
    config = JSON.stringify(config);
  } else {
    config = "";
  }
  
  callExec = function() {
    var cmd = ["node bin/ready.js"];
    if (config != "") { cmd.push(confPath); }
    cmd.push(argv);
    cmd = cmd.join(" ").toString();
    
    console.log("EXEC : " + cmd);
    cp.exec(cmd, callback);
  }
  
  if (config != "") {
    // Save the config file
    var confPath = path.join(__dirname, "conf.js")
    fs.open(confPath, "w", 0755, function(err, fd) {
      fs.write(fd, config, null, null, function(err) {
        console.log("Config is : " + config);
        fs.close(fd);
        callExec();
      }); 
    });
  } else {
    callExec();
  }
}

// Get code from all.js
function getAggCode(config) {
  if (config) {
    return fs.readFileSync(config.dest + "/" + config.aggregateTo).toString();
  } else {
    return fs.readFileSync(DEST + ALL).toString();
  }
}

// All tests to run
var tests = {
  // Analyse
  "analyse" : function(onEnd) {
    r.analyse('function load() {}', function(success, jslint) {
      a.ok(success);
      a.ok(jslint.errors.length == 0);

      r.analyse("function load() {", function(success, jslint) {
        a.ok(!success);
        a.ok(jslint.errors.length == 1);
        
        onEnd();
      });
    });
  },
  
  "jslint with options" : function(onEnd) {
    r.analyse("var f = eval('1');", function(success, jslint) {
      a.ok(success);
      a.ok(jslint.errors.length == 0);
      onEnd();
    }, {evil:true});
  },
  
  // 
  /********* COMMAND-LINE TESTS *********/
  // Default config
  "Default config" : function(onEnd) {
    createTwoFiles();
    
    exec(null, function(error, stdout, stderr) {
      // Check that minified files are not there
      a.throws(function() {
        fs.statSync(DEST + "js.min.js");
      });
      
      a.throws(function() {
        fs.statSync(DEST + "js2.min.js");
      });
      
      stat = fs.statSync(DEST + ALL, "minified exists");
      a.ok(stat.isFile());
      
      // Check that aggregate has no duplicate
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/\sjs\.js\s/).length, 1);
      
      onEnd();
    });
  },
  // Do not run compiler
  "Do not run compiler" : function(onEnd) {
    var config = getConfig({runGCompiler:false});
    createTwoFiles();
    
    exec(config, function(error, stdout, stderr) {
      // Check that there's an aggregate
      var stat = fs.statSync(DEST + config.aggregateTo);
      var code = fs.readFileSync(DEST + config.aggregateTo).toString();
      a.ok(stat.isFile());
      a.equal(code.match(/\/\* js.js \*\//g).length, 1);
      a.equal(code.match(/\/\* js2.js \*\//g).length, 1);
      a.equal(code.match(/\/\* .* \*\//g).length, 2);
      
      onEnd();
    });
  },
  // Change minified extension
  "Change minified extension" : function(onEnd) {
    createTwoFiles();
    
    exec(getConfig({compiledExtension:"xyz", keepCompiled:true}), function() {
      var stat = fs.statSync(DEST + "js.xyz.js");
      a.ok(stat.isFile());
      
      stat = fs.statSync(DEST + "js2.xyz.js");
      a.ok(stat.isFile());
      onEnd();
    });
  },
  // JSLint doesn't pass
  "JSLint doesn't pass" : function(onEnd) {
    createBadFile();
    
    exec(null, function(error, stdout, stderr) {
      a.notEqual(error, null);
      
      onEnd();
    });
  },
  // Invalid minified extension (uses 'min' as default)
  "Invalid minified extension (uses 'min' as default)" : function(onEnd) {
    createTwoFiles();
    
    exec(getConfig({compiledExtension:"..", keepCompiled:true}), function(error, stdout, stderr) {
      var stat = fs.statSync(DEST + "js.min.js");
      a.ok(stat.isFile());
      
      stat = fs.statSync(DEST + "js2.min.js");
      a.ok(stat.isFile());
    
      onEnd();
    });
  },
  // src and dest are the same
  "src and dest are the same" : function(onEnd) {
    createTwoFiles();
    
    exec(getConfig({src:SRC,dest:SRC,keepCompiled:true}), function(error, stdout, stderr) {
      var dest = SRC + "minified/"

      var stat = fs.statSync(dest + "js.min.js");
      a.ok(stat.isFile());
      
      stat = fs.statSync(dest + "js2.min.js");
      a.ok(stat.isFile());
    
      onEnd();
    });
  },
  // Test alphabetic order
  "Test alphabetic order" : function(onEnd) {
    createAlphaFiles();
    exec(null, function(error, stdout) {
      var code = fs.readFileSync(DEST + ALL).toString();
      var pos = [];
      pos.push(code.match(/a\.js/).index);
      pos.push(code.match(/b\.js/).index);
      pos.push(code.match(/c\.js/).index);
      
      pos.forEach(function(val, i) {
        if (pos[i+1]) { a.ok(val < pos[i+1]) };
      });
      
      onEnd();
    });
  },
  // Test custom order
  "Test custom order" : function(onEnd) {
    createAlphaFiles();
    exec(getConfig({order:["a.js", "c.js"]}), function(error, stdout) {
      var code = fs.readFileSync(DEST + ALL).toString();
      var pos = [];
      pos.push(code.match(/a\.js/).index);
      pos.push(code.match(/c\.js/).index);
      pos.push(code.match(/b\.js/).index);
 
      pos.forEach(function(val, i) {
        if (pos[i+1]) { a.ok(val < pos[i+1]) };
      });
            
      onEnd();
    });
  },
  "Test custom order args" : function(onEnd) {
    createAlphaFiles();
    execArgv(getConfig(), "--order '  a.js ,  c.js'", function(error, stdout) {
      var code = fs.readFileSync(DEST + ALL).toString();
      var pos = [];
      pos.push(code.match(/a\.js/).index);
      pos.push(code.match(/c\.js/).index);
      pos.push(code.match(/b\.js/).index);
 
      pos.forEach(function(val, i) {
        if (pos[i+1]) { a.ok(val < pos[i+1]) };
      });
      
      onEnd();
    });
  },
  // Test custom order
  "Test exclude" : function(onEnd) {
    createAlphaFiles();
    exec(getConfig({exclude:["a.js"]}), function(error, stdout) {
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/load\(\)\s\{\}/).length, 1);
      a.equal(code.match(/load\(\)\{\}/g).length, 2);
      
      onEnd();
    });
  },
  // Test custom order
  "Test exclude args" : function(onEnd) {
    createAlphaFiles();
    execArgv(getConfig(), "--exclude 'a.js'", function(error, stdout) {
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/load\(\)\s\{\}/).length, 1);
      a.equal(code.match(/load\(\)\{\}/g).length, 2);
      
      onEnd();
    });
  },
  // Subdirectories
  "Subdirectories" : function(onEnd) {
    createSubdir();
    
    exec(getConfig({recursive:true}), function(error, stdout) {
      a.ok(fs.statSync(SRC + "subdir/subdir.js").isFile());
      var code = fs.readFileSync(DEST + ALL).toString();
      
      a.ok(code.match(/js\.js/gi));
      a.ok(code.match(/js2\.js/gi));
      a.ok(code.match(/subdir\.js/gi));
      
      onEnd();
    });
  },
  // compiler error
  "compiler error" : function(onEnd) {
    createBadFile();
    exec(getConfig({test:false, runJslint:false}), function(error, stdout) {
      a.throws(function() {
        fs.statSync(DEST + "js.min.js");
      });
      
      a.throws(function() {
        fs.statSync(DEST + "js2.min.js");
      });
      
      a.ok(stdout.match(/Unexpected token/i))
    
      onEnd();
    }); 
  },
  "Recursive doesn't go into DEST directory" : function(onEnd) {
    createSubdir();
    
    var cfg = getConfig({recursive:true, dest:"./test/javascripts/minified/"});
    
    exec(cfg, function(error, stdout) {
      a.ok(fs.statSync(cfg.dest + cfg.aggregateTo).isFile());
  
      // Recall to make sure it doesn't go in minified    
      exec(cfg, function(error, stdout) {
        var code = getAggCode(cfg);
        a.ok(!code.match(/all\.js/));
        
        onEnd();
      });
    });
  },
  "If there's only one file" : function(onEnd) {
    createFile("onefile.js", "function onefile() {}");
    exec(null, function(error, stdout) {
      var code = getAggCode();
      a.ok(code.match(/onefile\(\)/));
      onEnd();
    });
  },
  "Override defaults" : function(onEnd) {
    createTwoFiles();
    var cfg = getConfig({src:'void', dest:'void'});
    execArgv(cfg, "--src " + SRC + " -d " + DEST, function(error, stdout) {
      // Check that minified files are not there
      a.throws(function() {
        fs.statSync(DEST + "js.min.js");
      });
      
      a.throws(function() {
        fs.statSync(DEST + "js2.min.js");
      });
      
      stat = fs.statSync(DEST + ALL, "minified exists");
      a.ok(stat.isFile());
      
      // Check that aggregate has no duplicate
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/\sjs\.js\s/).length, 1);
      onEnd();
    });    
  },
  "no dest" : function(onEnd) {
    createTwoFiles();
    var cfg = getConfig({src:'void'});
    execArgv(cfg, "-s " + SRC, function(error, stdout) {
      // Check that minified files are not there
      a.throws(function() {
        fs.statSync(DEST + "js.min.js");
      });
      
      a.throws(function() {
        fs.statSync(DEST + "js2.min.js");
      });
      
      stat = fs.statSync(DEST + ALL, "minified exists");
      a.ok(stat.isFile());
      
      // Check that aggregate has no duplicate
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/\sjs\.js\s/).length, 1);
      
      onEnd();
    });    
  },
  "no configuration"  : function(onEnd) {
    createTwoFiles();
    execNoConfig("-s " + SRC + " --dest " + DEST, function(error, stdout) {
      a.equal(stdout.match(/usage\:/).length, 1);
      onEnd();
    });    
  },
  "two args"  : function(onEnd) {
    createTwoFiles();
    execNoConfig(SRC + " " + DEST, function(error, stdout) {
      // Check that minified files are not there
      a.throws(function() {
        fs.statSync(DEST + "js.min.js");
      });
      
      a.throws(function() {
        fs.statSync(DEST + "js2.min.js");
      });
      
      stat = fs.statSync(DEST + ALL, "minified exists");
      a.ok(stat.isFile());
      
      // Check that aggregate has no duplicate
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/\sjs\.js\s/).length, 1);
      
      onEnd();
    });    
  },
  "override jslint with args"  : function(onEnd) {
    createTwoFiles();
    createBadFile();
    
    execArgv(getConfig(), "--nojslint --nocompiler", function(error, stdout, stderr) {

      // It just dumped to all.js
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/\sbad\.js\s/).length, 1);
      a.equal(code.match(/\js\.js\s/).length, 1);
      
      onEnd();
    }); 
  },
  "specify jslintOptions in argv"  : function(onEnd) {
    createFile("evil.js", "eval('var i = 1;');");
    
    execNoConfig(SRC + " " + DEST + " --debug=true --evil=true", function(error, stdout, stderr) {
      var code = fs.readFileSync(DEST + "all.js").toString();
      a.equal(code.match(/\sevil\.js\s/).length, 1);
      
      onEnd();
    }); 
  },
  "specify maxlen as integer"  : function(onEnd) {
    createFile("evil.js", "eval('var i = 1;');");
    
    execNoConfig(SRC + " " + DEST + " --debug --evil --maxlen=1", function(error, stdout, stderr) {
      a.equal(stdout.match(/eval is evil/g), null);
      a.equal(stdout.match(/Line too long/g).length, 1);
      
      onEnd();
    }); 
  },
  "same name in subdir" : function(onEnd) {
    createFile("file.js", "function main() {}");
    createFile("file.js", "function subdir1() {}", {subdir:"subdir1"});
    createFile("file.js", "function subdir2() {}", {subdir:"subdir2"});
    
    execNoConfig(SRC + " " + DEST, function(err, stdout, stderr) {
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/\sfile\.js\s/ig).length, 3);
      onEnd();
    });
  },
  "no recursive" : function(onEnd) {
    createFile("file.js", "function main() {}");
    createFile("file.js", "function subdir1() {}", {subdir:"subdir1"});
    createFile("file.js", "function subdir2() {}", {subdir:"subdir2"});
    
    execArgv(getConfig(), "--no-recursive", function(error, stdout, stderr) {
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/\sfile\.js\s/ig).length, 1);
      
      execArgv(getConfig(), "--norecursive", function(error, stdout, stderr) {
        var code = fs.readFileSync(DEST + ALL).toString();
        a.equal(code.match(/\sfile\.js\s/ig).length, 1);
        onEnd();
      });
    });
  },
  "try new options" : function(onEnd) {
    createTwoFiles();
    createBadFile();
    
    execArgv(getConfig(), "--no-analysis --no-compile", function(error, stdout, stderr) {

      // It just dumped to all.js
      var code = fs.readFileSync(DEST + ALL).toString();
      a.equal(code.match(/\sbad\.js\s/).length, 1);
      a.equal(code.match(/\js\.js\s/).length, 1);
      
      onEnd();
    }); 
  },
  "no aggregation using aggregateTo" : function(onEnd) {
    createTwoFiles();
    
    exec(getConfig({aggregateTo:""}), function(error, stdout, stderr) {
      fs.stat(DEST + ALL, function(err, stats) {
        a.equal(err.code, "ENOENT");
      });
      
      onEnd()
    }); 
  },
  "no aggregation" : function(onEnd) {
    createTwoFiles();
    
    execArgv(getConfig(), "--no-aggregate", function(error, stdout, stderr) {
      a.ok(!stdout.match(/aggregating/i));
    
      // It is not dumped to all.js
      fs.stat(DEST + ALL, function(err, stats) {
        a.equal(err.code, "ENOENT");
        onEnd();
      });
    }); 
  },
};

if (process.argv[2]) {
  var t = process.argv[2];
  if (tests[t]) {
    cleanUp();
    tests[t](cleanUp);
  } else {
    console.log(("ERROR : '"+t+"' does not exist").red)
  }
} else {
  var keys = [];
  for (var p in tests) {
    keys.push(p);
  }

  (function execTest() {
    cleanUp();
    var key = keys.shift();
    if (key) {
      console.log(("\n"+key).bold);
      if (tests[key]) { 
        tests[key](execTest);
      }
    } 
  })();
}
