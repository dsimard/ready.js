{dir, log} = console
{inspect} = require 'util'
async = require '../node_modules/async'
{minify} = require '../node_modules/uglify-js'
file = require '../lib/file'
{sourcesToFiles} = require('../lib/listfiles')

# ## Events
#
# Ready.js emits these events :
#
# - analyze(file, jshint) : Everytime a file is analyzed
# - file.uglify(file, jshint) : For every uglified file

r =
  # ## compile(sources, [options], callback(err, minified))
  #
  # Compile all .js files from the specified sources (can be directories and/or files)
  #
  #     ready.compile(['./js', 'lib/cat.js'], {analyse:false}, function(err, minified) {
  #     });
  #
  # ### `options`
  #
  # - `ignore` default is `[]` : A list of files to ignore. (ex : _jquery*.js)
  # - `analyze` default is `true` : If should analyze files through jshint
  # - `recursive` default is `true` : If should go through directory recursively
  #
  # ### `callback(err, minified)`
  #
  # - `err` : The errors that happened. If jshint didn't pass, `err` will contain formatted jshint errors
  # - `minified` : The aggregated minified code for all files
  compile: (sources, options, callback)->
    [callback, options] = [options, {}] if typeof options is 'function'
    
    sourcesToFiles sources, options, (err, files)->
      return callback(err) if err?
      
      # Wrapper for analyze
      analyzeWrapper = (filename, callback)->
        file.analyze filename, options, callback
      
      async.forEach files, analyzeWrapper, (err)->
        return callback(err) if err?
        
        r.uglify sources, options, callback
          
  # ## uglify(sources, options, callback)
  #
  # Uglify all files from the sources
  #
  #     ready.uglify(['./js', 'lib/cat.js'], {recursive:false}, function(err, minified) {
  #     });
  #
  # ### `options`
  #  
  # - `recursive` default is `true` : If should go through directory recursively
  #
  # ### `callback(err, minified)`
  #
  # - `err` : The errors that happened. If jshint didn't pass, `err` will contain formatted jshint errors
  # - `minified` : The aggregated minified code for all files
  uglify: (sources, options, callback)->
    allFilesOptions = {recursive:(options.recursive ? true)}
    sourcesToFiles sources, allFilesOptions, (err, allFiles)->
      return callback(err) if err?
      
      # If there are no files, throw an error
      return callback('There are no files to readyjsize') if allFiles.length == 0
      
      # If there is a listener for 'file.uglify', uglify each file individually
      if r.listeners('file.uglify').length > 0
        async.forEach allFiles, r.uglifyFile, ->
          r.uglifyBatch allFiles, callback
      else
        r.uglifyBatch allFiles, callback     
      
  
  uglifyBatch: (files, callback)->
    min = minify files
    callback null, min.code
      
  uglifyFile: (filename, callback)->
    minified = minify filename
    r.emit 'file.uglify', filename, minified
    callback null, minified
    
  
          
r[k] = func for k, func of require('events').EventEmitter.prototype

# Re-emit the analyze event from file
file.on 'analyze', (file, jshint)->
  r.emit 'analyze', file, jshint
  
module.exports = r
