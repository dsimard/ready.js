# This file takes care of the output
path = require 'path'
fs = require 'fs'
fileExists = fs.exists || path.exists
minimatch = require '../node_modules/minimatch'
{log} = console

r =
  # ## Write
  #
  # callback(`err`)
  write: (content, destination, callback)->
    return console.log content unless destination?

    # If it's not a js file, it's a directory
    if minimatch destination, '**/*.js'
      r.writeToFile content, destination, callback
    else
      # Write to all.js in the directory
      r.writeToFile content, "#{destination}/all.js", callback

  writeToFile: (content, destination, callback)->
    fs.writeFile destination, content, (err)->
      return callback(err) if err?
      
      callback()
  
  # ## writeToDir(content, options callback)
  #
  # Writes a file to the output directory
  writeToDir: (content, filename, options, callback)->
    output = options.output
    
    # If output is a file, extract dir
    outputDir = output
    if minimatch output, '**/*.js'
      outputDir = path.dirname output

    r.writeToFile content, "#{outputDir}/#{filename}", callback
    
      
module.exports = r
