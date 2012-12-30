path = require 'path'
fs = require 'fs'
_ = require 'underscore'
async = require 'async'

r = 
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
    
    async.map sources, r.sourceToFiles, (err, files)->
      return callback(err) if err
      callback err, _.uniq(_.flatten(files))
    
    
  # ## SourceToFiles(source, callback(err, files))
  #
  # Takes a single source (a file or a directory) and transforms it to resolved file paths
  sourceToFiles: (source, callback)->
    resolved = path.resolve source
    fs.exists resolved, (exists)->
      return callback "`#{resolved}` doesn't exist" unless exists
      
      # Check if a directory
      fs.stat resolved, (err, stats)->
        if stats.isDirectory()
          # List all .js files
          fs.readdir resolved, (err, files)->
            jsFiles = _.filter files, (file)->
              path.extname(file) is '.js'
              
            jsFiles = jsFiles.map (file)->
              path.resolve "#{resolved}/#{file}"
              
            callback null, jsFiles
        else
          callback null, [path.resolve(source)]
          
module.exports = r
