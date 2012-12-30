{dir, log} = console
path = require 'path'
fs = require 'fs'
jshint = require("jshint").JSHINT
readyReporter = require './readyreporter'


r = 
  # ## Compile(file, callback)
  #
  # Compiles a single file
  #
  #     fileReady.compile('cat.js', function(err) {
  #     }); 
  compile : (file, callback)->
    # Load the file if it exists
    resolved = path.resolve(file) 
    fs.exists resolved, (exists)->
      return callback("'#{resolved}' doesn't exist") unless exists
      
      # Load it in a string
      fs.readFile resolved, (err, code)->
        return callback err if err?
        
        code = code.toString()

        # Call jshint
        return callback(readyReporter.reporter(resolved, jshint.errors)) unless jshint(code)
        
        callback()
  
module.exports = r
    
