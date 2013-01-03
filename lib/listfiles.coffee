# This files takes the different sources and creates an array of every single file
path = require 'path'
fs = require 'fs'
{log, dir} = console
{inspect} = require 'util'
fileExists = fs.exists || path.exists

_ = require '../node_modules/underscore'
async = require '../node_modules/async'
readdirp = require '../node_modules/readdirp'
minimatch = require '../node_modules/minimatch'

r = 
  # ## SourcesToFiles(sources, options, callback(err, files))
  #
  # This will take a source array containing directories and files and will
  # transform it to an array of files only
  #
  #     sourcesToFile(['./js', 'lib/cat.js'], function(files) {
  #       // will return ['/path/to/js/a.js', '/path/to/js/b.js', '/path/to/lib/cat.js']
  #     });    
  #
  # Callback has one argument. `files` contains complete path to all files.
  #
  # `options` is a hash : `{recursive:boolean}`
  sourcesToFiles: (sources, options, callback=(->))->
    [callback, options] = [options, {}] if typeof options is 'function'

    sources = [sources] if typeof sources is 'string'
    
    # This is a wrapper so I can use options
    sourceToFiles = (source, callback)->
      r.sourceToFiles source, options, callback
    
    async.map sources, sourceToFiles, (err, files)->
      return callback(err) if err
      callback err, _.uniq(_.flatten(files))
    
    
  # ## SourceToFiles(source, options, callback(err, files))
  #
  # Takes a single source (a file or a directory) and transforms it to resolved file paths
  sourceToFiles: (source, options, callback)->
    [callback, options] = [options, {}] if typeof options is 'function'
    
    resolved = path.resolve source
    fileExists resolved, (exists)->
      return callback "`#{resolved}` doesn't exist" unless exists
      
      # Check if a directory
      fs.stat resolved, (err, stats)->
        if stats.isDirectory()
          # Wrapper for file info
          filterFileInfoWrapper = (info)->
            r.filterFileInfo(info, options)
        
          # Run recursively or not
          readdirpOptions = {root:resolved,fileFilter:filterFileInfoWrapper}
          readdirpOptions.depth = 0 if options.recursive? && !options.recursive
                    
          readdirp readdirpOptions, (err, res)->
            return callback(err) if err?  
                      
            files = res.files.map (file)->(file.fullPath)
            callback null, files
        else
          callback null, [path.resolve(source)]
          
  # ## filterFileInfo(info)
  #
  # Filters file info sent by readdirp
  filterFileInfo: (info, options)->
    r.filterFilename info.name, options
    
  # ## filterFilename(name)
  filterFilename: (name, options)->
    keep = minimatch(name, '*.js')
    ignore = r.ignoreFile(name, options)
    keep and not ignore
    
  # ## ignoreFile(name)
  #
  # If the file should be ignored
  ignoreFile: (name, options)->
    ignoreList = _.flatten [(options.ignore ? [])]
    _.any ignoreList, (i)->
      minimatch(name, i)
          
module.exports = r
