var sys = require("sys"),
  fs = require("fs"),
  cp = require("child_process");

var initTest = function(a) {
  var rm = function(file, a) {
    try {
      fs.unlinkSync(file);
    } catch(e) {}
    
    var stat = null;  
    try {
      stat = fs.statSync(file);
    } catch(e) {}

    if (stat && stat.isFile()) { a.eql(true, false, file + " not deleted"); }
  }

  files = ["./test/example/minified/js.min.js",
    "./test/example/minified/js2.min.js",
    "./test/example/minified/all.js"
  ];
  
  for (var f in files) {
    rm(files[f], a);
  }  
  
  try {
    fs.rmdirSync("./test/example/minified/");
  } catch(e) {}
  
  var stat = null;  
  try {
    stat = fs.statSync("./test/example/minified/");
  } catch(e) {}
  
  if (stat && stat.isDirectory()) { a.eql(true, false, "folder not deleted"); }
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

var exec = function exec(config, cb) {
  if (typeof(config) != "string") {
    config = "'" + JSON.stringify(config) + "'";
  } 
  
  var cmd = ["node ready.js ", config].join(" ").toString();
  
  initTest();
  cp.exec(cmd, cb);
}

// All the tests
tests = {
  "example config" : function(a) {
    var config = getConfig();
  
    exec(config, function(error, stdout, stderr) {
      // Check that all files are there
      var stat = fs.statSync("test/example/minified/js.min.js");
      a.eql(stat.isFile(), true);

      stat = fs.statSync("test/example/minified/all.js");
      a.eql(stat.isFile(), true);
      
      // Check that aggregate has no duplicate
      var code = fs.readFileSync("test/example/minified/all.js").toString();
      a.eql(code.match(/\sjs\.min\.js\s/).length, 1);
    });
  },
  "config as a file" : function(a) {
    exec("./test/example/example.conf.js", function(error, stdout, stderr) {
      a.isNull(error);
    });
  },
  "don't compile" : function(a) {
    var config = getConfig({runGCompiler:false});
    
    exec(config, function(error, stdout, stderr) {
      // Check that there's an aggregate
      var stat = fs.statSync(config.aggregateTo);
      var code = fs.readFileSync(config.aggregateTo).toString();

      a.eql(true, stat.isFile());
      
      a.eql(code.match(/\/\* js.js \*\//g).length, 1);
      a.eql(code.match(/\/\* js2.js \*\//g).length, 1);
      a.eql(code.match(/\/\* .* \*\//g).length, 2);
    });
  },
  "don't aggregate" : function(a) {
    var config = getConfig({aggregateTo:""});
    
    exec(config, function(error, stdout, stderr) {
      a.isNull(error)
    });
  },
}

for (var t in tests) {
  exports[t] = (function(te) {
    return function(a, b) {
      initTest();
      te(a, b);
      initTest();
    }
  })(tests[t]);
}

