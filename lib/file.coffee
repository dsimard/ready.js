# This file contains everything related to a single file specifed in the source
{dir, log} = console
{inspect} = require 'util'
path = require 'path'
fs = require 'fs'
jshint = require("../node_modules/jshint").JSHINT
coffee = require "../node_modules/coffee-script"
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
    r.readFileForceJs file, (err, code)->
      return callback err if err?

      # Call jshint if should analyze code
      analyze = options.analyze ? true

      if analyze
        jshintOk = jshint(code)
        r.emit 'analyze', file, jshint
        return callback(readyReporter.reporter(file, jshint.errors)) unless jshintOk       
        
      callback()

  isCoffee : (file)->
    path.extname(file).toLowerCase() is '.coffee'

  # ## readJsFile
  #
  # Return the code from a js or coffee file and return js
  readFileForceJs : (file, callback)->
    fs.readFile file, (err, code)->
      return callback err if err?

      code = code.toString()

      try
        code = coffee.compile(code) if r.isCoffee(file)
      catch error
        return callback error

      callback null, code
  
r[k] = func for k, func of require('events').EventEmitter.prototype
  
module.exports = r
    
