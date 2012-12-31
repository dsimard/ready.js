{dir, log} = console
{inspect} = require 'util'
async = require '../node_modules/async'
fileReady = require '../lib/fileready'
{sourcesToFiles} = require '../lib/listfiles'

r =
  # ## Compile(sources, callback(err))
  #
  # Compile all .js files from the specified sources (can be directories and/or files)
  #
  #     ready.compile(['./js', 'lib/cat.js'], function(err) {
  #     });
  compile: (sources, callback)->
    sourcesToFiles sources, (err, files)->
      return callback(err) if err?
      
      files.forEach (file)->
        fileReady.compile file, (err)->
          callback(err)
  
module.exports = r
