{dir, log} = console
{inspect} = require 'util'
async = require '../node_modules/async'
fileReady = require '../lib/fileready'

r =
  # ## Compile(sources, callback(err))
  #
  # Compile all .js files from the specified sources (can be directories and/or files)
  #
  #     ready.compile(['./js', 'lib/cat.js'], function(err) {
  #     });
  compile: (sources, callback)->
    sources = [sources] if typeof sources is 'string'
    
    sources.forEach (file)->
      fileReady.compile file, (err)->
        callback(err)
  
module.exports = r
