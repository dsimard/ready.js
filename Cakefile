{exec} = require 'child_process'
{log, error} = console
util = require 'util'
{inspect} = util
fs = require 'fs'
path = require 'path'
#extrafs = require './node_modules/fs-extra'
coffee = require './node_modules/coffee-script'
_ = require './node_modules/underscore'

exec = (cmd, options, callback=null)->
  log "Executing `#{cmd}`"
  require('child_process').exec cmd, options, callback

# ## compileCoffeescripts(directory, option={})
#
# Compile all the coffeescripts into javascript files from a directory
#
# `options.shebangs` : If it should add a shebang at the top of the file
compileCoffeescripts = (directory, options={})->
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

# ## generateDoccoHusky(directories=[])
#
# Generate doc with [docco-husky](https://github.com/mbrevoort/docco-husky)
# and push it to the `gh-pages` branch.
generateDoccoHusky = (directories)->
  directories = (_.flatten([directories])).join ' '
  directory = path.resolve './'
  
  # Create a tmp directoryectory
  exec 'mktemp -d', (err, stdout, stderr)->
    error err if err?
    tmp = stdout.replace(/^\s*|\s*$/g, '') 
    
    # clone the git in that temp directory
    exec "git clone #{directory} #{tmp}", (err, stdout, stderr)->
      error err if err?
      log stdout
      
      # Change branch to gh-pages      
      exec "git checkout gh-pages", {cwd:tmp}, (err, stdout, stderr)->
        log 'testststst #{err}' 
        error err if err?
        log stdout
        
        # Create doc       
        exec "./node_modules/.bin/docco-husky #{directories}", (err, stdout, stderr)->
          error err if err?
          log stdout
          
          # Move the doc to the tmp directory
          exec "cp #{directory}/docs/* #{tmp} -r", (err, stdout, stderr)->
            error err if err?
            log stdout
            
            # Commit to gh-pages
            exec "git add . && git commit -am 'Generated automatically'", {cwd:tmp}, (err, stdout, stderr)->
              error err if err?
              log stdout
              
              # Push to gh-pages
              exec "git push origin gh-pages", {cwd:tmp}, (err, stdout, stderr)->
                error err if err?
                log stdout
                
                # Remove the docs directory
                exec "rm docs" 
  

task 'doc', 'Regenerate doc', (options)->
  generateDoccoHusky ['lib/', 'bin/']
      
task 'build', 'build scripts to be compatible with js', ->
  compileCoffeescripts 'bin'
  compileCoffeescripts 'lib'
      
task 'clean', 'Remove all js files', ->
  exec 'rm bin/ready.js', (err, stdout, stderr)->
    log stderr
    exec 'rm lib/*.js', (err, stdout, stderr)->
      log stdout

