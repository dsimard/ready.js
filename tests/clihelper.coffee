{exec} = require 'child_process'
{inspect} = require 'util'
{log, dir} = console
path = require 'path'
_ = require '../node_modules/underscore'

r = 
  execute: (files, options={}, callback)->
    files = _.flatten [files]
    [callback, options] = [options, {}] unless callback?
    
    cmd = "./node_modules/.bin/coffee ./bin/ready.coffee #{files.join ' '}"
    cwd = path.resolve './'
    args = r.optionsToArgs options
    log "CMD : #{cmd} #{args}"
    exec "#{cmd} #{args}", {cwd:cwd}, (err, stdout, stderr)->
      err = null if err is ''
      callback err, stdout
      
  optionsToArgs: (options)->
    dir options
    _.map _.pairs(options), (option)->
      switch option[0]
        when 'recursive'
          if option[1] then '' else '--no-recursive'
        when 'analyze' 
          if option[1] then '' else '--no-analyze'
        when 'ignore'
          values = _.flatten [option[1]]
          "--ignore '#{values.join ' '}'"
        
        else throw "Option `#{option[0]}` not mapped"
  
module.exports = r
