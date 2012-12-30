{dir, log} = console
{inspect} = require 'util'
path = require 'path'
fs = require 'fs'
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
        
        
  # ## SourcesToFiles(sources, callback(err, files))
  #
  # This will take a source array containing directories and files and will
  # transform it to an array of files only
  #
  #     sourcesToFile(['./js', 'lib/cat.js'], function(files) {
  #       // will return ['/path/to/js/a.js', '/path/to/js/b.js', '/path/to/lib/cat.js']
  #     });    
  #
  # Callback has one argument. `files` contains complete path to all files
  sourcesToFiles: (sources, callback)->
    sources = [sources] if typeof sources is 'string'
    
    async.map sources, r.sourceToFiles, (err, results)->
    
    
  # ## SourceToFiles(source, callback(err, files))
  #
  # Takes a single source (a file or a directory) and transforms it to resolved file paths
  sourceToFile: (source, callback)->
    resolved = path.resolve source
    fs.exists resolved, (exists)->
      return callback "`#{resolved}` doesn't exist" unless exists
      callback null, [path.resolve(source)]
      
      # Check if a directory
      #fs.stat resolved, (err, stats)->
        
  
module.exports = r
