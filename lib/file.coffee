# This file contains everything related to a single file specifed in the source
{dir, log} = console
path = require 'path'
fs = require 'fs'
jshint = require("../node_modules/jshint").JSHINT
readyReporter = require './reporter'

r = 
  # ## Analyze(file, callback)
  #
  # Analyze a single file with jshint
  #
  #     fileReady.analyze('cat.js', function(err) {
  #     }); 
  compile : (file, callback)->
    # Load it in a string
    fs.readFile file, (err, code)->
      return callback err if err?
      
      code = code.toString()

      # Call jshint
      return callback(readyReporter.reporter(file, jshint.errors)) unless jshint(code)        
      callback()
  
module.exports = r
    
