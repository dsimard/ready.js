{dir, log} = console
{inspect} = require 'util'
async = require '../node_modules/async'
{minify} = require '../node_modules/uglify-js'
file = require '../lib/file'
{sourcesToFiles} = require '../lib/listfiles'

r =
  # ## Compile(sources, [options], callback(err, minified))
  #
  # Compile all .js files from the specified sources (can be directories and/or files)
  #
  #     ready.compile(['./js', 'lib/cat.js'], function(err) {
  #     });
  compile: (sources, options, callback=(->))->
    [callback, options] = [options, {}] if typeof options is 'function'
      
    sourcesToFiles sources, options, (err, files)->
      return callback(err) if err?
      
      async.forEach files, file.compile, (err)->
        return callback(err) if err?
        
        # Uglify them
        min = minify files
        callback null, min.code
          
  
module.exports = r
