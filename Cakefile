{exec} = require 'child_process'
{log, error} = console
util = require 'util'
{inspect} = util
bakerhelper = require './lib/cake_module/bakerhelper.coffee'

task 'doc', 'Regenerate doc', (options)->
  bakerhelper.generateDoccoHusky ['lib/', 'bin/']
      
task 'build', 'build scripts to be compatible with js', ->
  log(inspect(bakerhelper))
  bakerhelper.compileCoffeescripts 'bin', shebang:true
  bakerhelper.compileCoffeescripts 'lib'
      
task 'clean', 'Remove all js files', ->
  bakerhelper.exec 'rm bin/*.js', ->
    bakerhelper.exec 'rm lib/*.js'

