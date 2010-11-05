var sys = require("sys"),
  fs = require("fs"),
  cp = require("child_process");
  a = require("assert");

// Delete all unwanted files
function cleanUp() {
  var rm = function(file) {
    try {
      fs.unlinkSync(file);
    } catch(e) {}
    
    var stat = null;  
    try {
      stat = fs.statSync(file);
    } catch(e) {}
  }

  files = ["./test/example/minified/js.min.js",
    "./test/example/minified/js2.min.js",
    "./test/example/minified/all.js",
    "./test/example/minified/js.xyz.js",
    "./test/example/minified/js2.xyz.js",
  ];
  
  files.forEach(function(file) { rm(file); });
  
  try {
    fs.rmdirSync("./test/example/minified/");
  } catch(e) {}
}

// Create a default config
function getConfig(extend) {
  extend = extend || {};
  
  var c = { src : "./test/example/javascripts",
   dest : "./test/example/minified",
   aggregateTo : "./test/example/minified/all.js",
   test : true
  };
  
  for (var p in extend) {
    c[p] = extend[p];
  }
  
  return c;
}

// Creates 2 js files
function create2Files() {
  fs.writeFileSync("./test/example/javascripts/js.js", "function() {}");
  fs.writeFileSync("./test/example/javascripts/js2.js", "function() {}");
}

// Execute a ready.js
function exec(config, cb) {
  if (typeof(config) != "string") {
    config = "'" + JSON.stringify(config) + "'";
  } 
  
  var cmd = ["node ready.js ", config].join(" ").toString();
  cp.exec(cmd, cb);
}

// All tests to run
var tests = [
  function(onEnd) {
    var config = getConfig();

    exec(config, function(error, stdout, stderr) {
      // Check that all files are there
      var stat = fs.statSync("test/example/minified/js.min.js");
      a.ok(stat.isFile());
      
      stat = fs.statSync("test/example/minified/js2.min.js");
      a.ok(stat.isFile());

      stat = fs.statSync("test/example/minified/all.js", "minified exists");
      a.ok(stat.isFile());
      
      // Check that aggregate has no duplicate
      var code = fs.readFileSync("test/example/minified/all.js").toString();
      a.equal(code.match(/\sjs\.min\.js\s/).length, 1);
      
      onEnd();
    });
  },
  function(onEnd) {
    var config = getConfig({runGCompiler:false});
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
  function(onEnd) {
    exec(getConfig({minifiedExtension:"xyz"}), function() {
      var stat = fs.statSync("./test/example/minified/js.xyz.js");
      a.ok(stat.isFile());
      
      stat = fs.statSync("./test/example/minified/js2.xyz.js");
      a.ok(stat.isFile());
      onEnd();
    });
  }
];

(function execTest() {
  cleanUp();
  var test = tests.shift();
  if (test) { test(execTest); }
  cleanUp();
})();
