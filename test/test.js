var sys = require("sys");
var r = require(process.cwd() + "/ready");
module.exports = {
  "example config" : function(a) {
    var config = JSON.stringify({ src : "./test/example/javascripts",
       dest : "./test/example/minified",
       aggregateTo : "./test/example/minified/all.js",
       debug : true
     });
    
    r.loadConfig(config);     
    r.execute();
  }
}

