# This file contains everything related to a single file specifed in the source
{dir, log} = console
{inspect} = require 'util'
path = require 'path'
fs = require 'fs'
jshint = require("../node_modules/jshint").JSHINT
readyReporter = require './reporter'

# ## Events
# 
# analyze(filename, jshint, err)
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
        jshintOk = jshint(code)
        r.emit 'analyze', file, jshint
        return callback(readyReporter.reporter(file, jshint.errors)) unless jshintOk       
        
      callback()
  
r[k] = func for k, func of require('events').EventEmitter.prototype
  
module.exports = r
    
