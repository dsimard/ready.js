var sys = require("sys"),
  fs = require("fs"),
  cp = require("child_process");
  a = require("assert"),
  r = require("../ready"),
  ins = sys.inspect;
  
  
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
   debug: true,
  };
  
  for (var p in extend) {
    c[p] = extend[p];
  }

  return c;
}

// Create a file
function createFile(path, code, options) {
  options = options || {};

  code = code || ["function load() {}"].join("");

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

// Execute a ready.js
function exec(config, cb) {
  if (typeof(config) == "function") {
    cb = config;
    config = getConfig();
  }
  
  if (typeof(config) != "string") {
    config = "'" + JSON.stringify(config) + "'";
  }
  
  var cmd = ["node bin/ready.js ", config].join(" ").toString();
  console.log("EXEC : " + cmd);
  cp.exec(cmd, cb);
}

// All tests to run
var tests = [
  // Compile with google compiler
  function(onEnd) {
    createAlphaFiles();
    
    r.compile("function load() { var a = 1; }", function(success, compiledCode, data) {
      a.equal(compiledCode, "function load(){};");
      
      r.compile(SRC + "a.js", function(success, compiledCode, data) {
        a.equal(compiledCode, "function load(){};");
        
        r.compile("{(}", function(success, compiledCode, data) {
          a.ok(!success);
          a.ok(compiledCode.length == 0);
          onEnd();
        });
      });      
    });
  },
  // jslint
  function(onEnd) {
    r.jslint("function load() {}", function(success, jslint) {
      a.ok(success);
      a.ok(jslint.errors.length == 0);

      r.jslint("function load() {", function(success, jslint) {
        a.ok(!success);
        a.ok(jslint.errors.length == 1);
        
        onEnd();
      });
    });
  },
  // 
  /********* COMMAND-LINE TESTS *********/
  // Default config
  function(onEnd) {
    createTwoFiles();

    exec(function(error, stdout, stderr) {  
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
  function(onEnd) {
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
  function(onEnd) {
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
  function(onEnd) {
    createBadFile();
    
    exec(function(error, stdout, stderr) {
      a.notEqual(error, null);
      
      onEnd();
    });
  },
  // Invalid minified extension (uses 'min' as default)
  function(onEnd) {
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
  function(onEnd) {
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
  function(onEnd) {
    createAlphaFiles();
    exec(function(error, stdout) {
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
  function(onEnd) {
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
  // Subdirectories
  function(onEnd) {
    createTwoFiles();
    createFile("subdir.js", "function subdir() {}", {subdir:"subdir"});
    
    exec(function(error, stdout) {
      a.ok(fs.statSync(SRC + "subdir/subdir.js").isFile());
      var code = fs.readFileSync(DEST + ALL).toString();
      
      a.ok(code.match(/js\.js/gi));
      a.ok(code.match(/js2\.js/gi));
      a.ok(code.match(/subdir\.js/gi));
      
      onEnd();
    });
  },
];

(function execTest() {
  cleanUp();
  var test = tests.shift();
  if (test) { 
    test(execTest);
  }
})();
