#!/usr/bin/env coffee
{dir} = console
fs = require 'fs'
ready = require '../lib/'

optimist = require('optimist')
  .usage('\nUsage: $0 [FILES OR DIRECTORIES] [options]')
  .options('o', {alias:'output'})
  .describe('o', 'The file in which to write the output')
  .options('i', {alias:'ignore'})
  .describe('i', 'Ignore these files from JSHint but output them in the aggregated file')
  .describe('no-recursive', 'Don\'t recurse in sub-directories')
  .options('h', {alias:'help'})
  .describe('h', 'Display this help')

argv = optimist.argv

optimist.showHelp() if argv._.length == 0 || argv.help?

# Create an array with ignore list
argv.ignore = argv.ignore.split(' ') if argv.ignore?
argv.i = argv.ignore

if argv._.length > 0
  log "TTTTTTTTTTTTT #{inspect argv}"
  ready.compile argv._, argv, (err, minified)->
    # If there was an error in the compiled file, show and exit
    if err?
      console.error err
      process.exit 1
    
    # Output in stdout if no output file was specified
    if argv.output?
      # If it's a directory, output with default filename
      fs.stats argv.output, (err, stats)->
        return callback err if err?
      
        fs.writeFile argv.output, minified, (err)->
          if err?
            console.error err
            process.exit 1
      
    else  
      console.log minified
