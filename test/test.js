var sys = require("sys");
var fs = require("fs");
var r = require(process.cwd() + "/ready");
module.exports = {
  "should do things" : function(a) {
  },
  "example config" : function(a) {
    var config = JSON.stringify({ src : "./test/example/javascripts",
       dest : "./test/example/minified",
       aggregateTo : "./test/example/minified/all.js",
       debug : true
     });
    
    r.loadConfig(config);     
    r.execute({onEnd : function() {
      // Check that all files are there
      var stat = fs.statSync("test/example/minified/js.min.js");
      a.eql(stat.isFile(), true);

      stat = fs.statSync("test/example/minified/all.js");
      a.eql(stat.isFile(), true);
      
      // Check that aggregate has no duplicate
      var code = fs.readFileSync("test/example/minified/all.js");
console.log(sys.inspect(code.toString()));
      a.eql(code.match(/\sjs\.min\.js\s/).length, 1);
    }});
  }
}

