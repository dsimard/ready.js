var sys = require("sys"),
  fs = require("fs"),
  cp = require("child_process");
  a = require("assert");
  
  
const SRC = "./test/javascripts/";
const DEST = "./test/minified/";
const ALL = "./test/minified/all.js";

// Delete all unwanted files
function emptyDir(dir, shouldRmDir) {
  shouldRmDir = shouldRmDir || false;

  var isDir = false;
  try {
    isDir = fs.statSync(dir).isDirectory();
  } catch(e) {}
  
  if (isDir) {
    var files = fs.readdirSync(dir);
    files.forEach(function(file) {
      fs.unlinkSync(dir + file);
    });
    
    if (shouldRmDir) {
      fs.rmdirSync(dir);
    }
  }
  
  return isDir;
}

function cleanUp() {
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
function createFile(path, data) {
  var fd = fs.openSync(path, "w+", 0755)
  fs.writeSync(fd, data);
  fs.closeSync(fd);
}

// Creates 2 js files
function createTwoFiles() {
  createFile(SRC + "js.js", "function load1() {}");
  createFile(SRC + "js2.js", "function load2() {}");
}

// Creates bad file
function createBadFile() {
  createFile(SRC + "bad.js", "{(}");
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
  
  var cmd = ["node ready.js ", config].join(" ").toString();
  cp.exec(cmd, cb);
}

// All tests to run
var tests = [
  // Default config
  function(onEnd) {
    createTwoFiles();

    exec(function(error, stdout, stderr) {
      // Check that all files are there
      var stat = fs.statSync(DEST + "js.min.js");
      a.ok(stat.isFile());
      
      stat = fs.statSync(DEST + "js2.min.js");
      a.ok(stat.isFile());

      stat = fs.statSync(ALL, "minified exists");
      a.ok(stat.isFile());
      
      // Check that aggregate has no duplicate
      var code = fs.readFileSync(ALL).toString();
      a.equal(code.match(/\sjs\.min\.js\s/).length, 1);
      
      onEnd();
    });
  },
  // Do not run compiler
  function(onEnd) {
    var config = getConfig({runGCompiler:false});
    createTwoFiles();
    
    exec(config, function(error, stdout, stderr) {
      // Check that there's an aggregate
      var stat = fs.statSync(config.aggregateTo);
      var code = fs.readFileSync(config.aggregateTo).toString();
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
    
    exec(getConfig({minifiedExtension:"xyz"}), function() {
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
    
    exec(getConfig({minifiedExtension:".."}), function(error, stdout, stderr) {
    
      var stat = fs.statSync(DEST + "js.min.js");
      a.ok(stat.isFile());
      
      stat = fs.statSync(DEST + "js2.min.js");
      a.ok(stat.isFile());
    
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
