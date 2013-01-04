{exec} = require 'child_process'
{log} = console
{inspect} = require 'util'
fs = require 'fs'
path = require 'path'
extrafs = require './node_modules/fs-extra'
coffee = require './node_modules/coffee-script'

# options.shebangs : boolean
compile = (directory, options={})->
  # Compile each coffee in js in bin
  directory = path.resolve directory
  fs.readdir directory, (err, files)->
    files.forEach (file)->
      # Check if it's a coffee file
      if path.extname(file) is '.coffee'
        filename = "#{directory}/#{file}"
        log "Read `#{filename}`"
        fs.readFile filename, (err, data)->
          console.error err and process.exit 1 if err?
          
          log "Compile `#{filename}`"        
          js = coffee.compile(data.toString())
          
          # Add a shebang on top
          js = "#!/usr/bin/env node\n#{js}" if options.shebangs
          
          # Save to file
          filename = filename.replace /\.coffee$/, '.js'
          log "Write to `#{filename}`"
          
          fs.writeFile filename, js, 'utf8', (err)->
            console.error err and process.exit 1 if err?
  

task 'doc', 'Regenerate doc', (options)->
  exec 'docco-husky lib/ bin/', (err, stdout, stderr)->
    return console.log err if err?
    console.log stdout
    
    #exec 'cd docs && git commit -am "Doc regenerated automatically" && cd ..', (err, stdout, stderr)->
    #  return console.log stderr if err?
      
      
task 'build', 'build scripts to be compatible with js', ->
  compile 'bin'
  compile 'lib'
      
task 'clean', 'Remove all js files', ->
  extrafs.remove 'bin/ready.js', ->
    exec 'rm lib/*.js'

