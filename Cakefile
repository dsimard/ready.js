{exec} = require 'child_process'
{log, error} = console
util = require 'util'
{inspect} = util
fs = require 'fs'
path = require 'path'
#extrafs = require './node_modules/fs-extra'
coffee = require './node_modules/coffee-script'
_ = require './node_modules/underscore'
bakerhelper = require './node_modules/bakerhelper'

task 'doc', 'Regenerate doc', (options)->
  bakerhelper.generateDoccoHusky ['lib/', 'bin/']
      
task 'build', 'build scripts to be compatible with js', ->
  log(inspect(bakerhelper))
  bakerhelper.compileCoffeescripts 'bin', shebang:true
  bakerhelper.compileCoffeescripts 'lib'
      
task 'clean', 'Remove all js files', ->
  bakerhelper.exec 'rm bin/*.js', ->
    bakerhelper.exec 'rm lib/*.js'

