{dir, log} = console
{inspect} = require 'util'
async = require '../node_modules/async'
{minify} = require '../node_modules/uglify-js'
file = require '../lib/file'
{sourcesToFiles} = require('../lib/listfiles')

r =
  # ## Compile(sources, [options], callback(err, minified))
  #
  # Compile all .js files from the specified sources (can be directories and/or files)
  #
  #     ready.compile(['./js', 'lib/cat.js'], function(err) {
  #     });
  #
  # `options` are :
  # - `ignore` default is `[]` : A list of files to ignore. (ex : _jquery*.js)
  # - `analyze` default is `true` : If should analyze files through jshint
  # - `recursive` default is `true` : If should go through directory recursively
  compile: (sources, options, callback=(->))->
    [callback, options] = [options, {}] if typeof options is 'function'
    
    sourcesToFiles sources, options, (err, files)->
      return callback(err) if err?
      
      # Wrapper for analyze
      analyzeWrapper = (filename, callback)->
        file.analyze filename, options, callback
      
      async.forEach files, analyzeWrapper, (err)->
        return callback(err) if err?
        
        # Uglify all files (no filter)
        allFilesOptions = {recursive:(options.recursive ? true)}
        sourcesToFiles sources, allFilesOptions, (err, allFiles)->
          return callback(err) if err?
          
          # If there are no files, throw an error
          return callback('There are no files to readyjsize') if allFiles.length == 0
          
          min = minify allFiles
          callback null, min.code
          
r[k] = func for k, func of require('events').EventEmitter.prototype

# Re-emit the analyze event from file
file.on 'analyze', (file, jshint)->
  r.emit 'analyze', file, jshint
  
module.exports = r
