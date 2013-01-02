# This file contains everything related to a single file specifed in the source
{dir, log} = console
{inspect} = require 'util'
path = require 'path'
fs = require 'fs'
jshint = require("../node_modules/jshint").JSHINT
readyReporter = require './reporter'

r = 
  # ## analyze(file, callback)
  #
  # Analyze a single file with jshint
  #
  #     fileReady.analyze('cat.js', function(err) {
  #     }); 
  analyze : (file, options, callback)->
    # Load it in a string
    fs.readFile file, (err, code)->
      return callback err if err?
      
      code = code.toString()

      # Call jshint if should analyze code
      analyze = options.analyze ? true

      if analyze
        return callback(readyReporter.reporter(file, jshint.errors)) unless jshint(code)        
        
      callback()
  
module.exports = r
    
