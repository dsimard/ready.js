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
    return console.log destination unless destination?

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
      
module.exports = r
