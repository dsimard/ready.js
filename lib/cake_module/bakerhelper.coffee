path = require 'path'
fs = require 'fs'
{exec} = require 'child_process'
{log, error} = console
{inspect} = require 'util'

coffee = require '../../node_modules/coffee-script'
_ = require '../../node_modules/underscore'
colors = require '../../node_modules/colors'

r = 
  # ### exec(cmd, options, callback)
  #
  # Overrides `child_process.r.exec` to log to console and exit if there's an error
  #
  #     bakerhelper.exec 'rm *.js', {cwd:'./lib'}, (err, stdout, stderr)->
  #
  # `options` : See (`child_process`)[http://nodejs.org/api/child_process.html#child_process_child_process_r.exec_command_options_callback] documentation
  #
  # The callback is passed three arguments (`err`, `stdout`, `stderr`)
  exec : (cmd, options, callback=null)->
    [callback, options] = [options, {}] if not callback?
    log "#{'Executing'.bold.green} `#{cmd}`"
    exec cmd, options, (err, stdout, stderr)->
      if err?
        error stderr.red
        process.exit 1
      
      log stdout.grey if stdout? && stdout != ''
      callback?(err, stdout, stderr)

  # ### compileCoffeescripts(directory, option={})
  #
  # Compile all the coffeescripts into javascript files from a directory (not recursive)
  #
  #     bakerhelper.compileCoffeescripts './lib/'
  #     bakerhelper.compileCoffeescripts './bin/', {shebang:true}
  #
  # `options.shebang` : If it should add a shebang at the top of the file
  compileCoffeescripts: (directory, options={})->
    # Compile each coffee in js in bin
    directory = path.resolve directory
    fs.readdir directory, (err, files)->
      files.forEach (file)->
        # Check if it's a coffee file
        if path.extname(file) is '.coffee'
          filename = "#{directory}/#{file}"
          log "#{'Read'.bold} #{filename.italic}"
          fs.readFile filename, (err, data)->
            console.error err and process.exit 1 if err?
            
            log "#{'Compile'.bold} #{filename.italic}"        
            js = coffee.compile(data.toString())
            
            # Add a shebang on top
            js = "#!/usr/bin/env node\n#{js}" if options.shebang
            
            # Save to file
            filename = filename.replace /\.coffee$/, '.js'
            log "#{'Write'.bold} to #{filename.italic}"
            
            fs.writeFile filename, js, 'utf8', (err)->
              error err and process.exit 1 if err?

  # ### generateDoccoHusky(directories=[])
  #
  # Generate doc with [docco-husky](https://github.com/mbrevoort/docco-husky)
  # and push it to the `gh-pages` branch.
  #
  #     bakerhelper.compileCoffeescripts ['./lib/', './bin']
  generateDoccoHusky: (directories)->
    directories = (_.flatten([directories])).join ' '
    directory = path.resolve './'
    
    # Create a tmp directoryectory
    r.exec 'mktemp -d', (err, stdout, stderr)->
      error err if err?
      tmp = stdout.replace(/^\s*|\s*$/g, '') 
      
      # clone the git in that temp directory
      r.exec "git clone #{directory} #{tmp}", (err, stdout, stderr)->
        error err if err?
        log stdout
        
        # Change branch to gh-pages      
        r.exec "git checkout gh-pages", {cwd:tmp}, (err, stdout, stderr)->
          error err if err?
          log stdout
          
          # Create doc       
          r.exec "docco-husky #{directories}", (err, stdout, stderr)->
            error err if err?
            log stdout
            
            # Move the doc to the tmp directory
            r.exec "cp #{directory}/docs/* #{tmp} -r", (err, stdout, stderr)->
              error err if err?
              log stdout
              
              # Commit to gh-pages
              r.exec "git add . && git commit -am 'Generated automatically'", {cwd:tmp}, (err, stdout, stderr)->
                error err if err?
                log stdout
                
                # Push to gh-pages
                r.exec "git push origin gh-pages", {cwd:tmp}, (err, stdout, stderr)->
                  error err if err?
                  log stdout
                  
                  # Remove the docs directory
                  r.exec "rm -r #{directory}/docs/" 
  
module.exports = r
