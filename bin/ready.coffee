#!/usr/bin/env coffee
{dir, log} = console
{inspect} = require 'util'
fs = require 'fs'
ready = require '../lib/'
output = require '../lib/output'

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
  ready.compile argv._, argv, (err, minified)->
    # If there was an error in the compiled file, show and exit
    if err?
      console.error err
      process.exit 1
    
    output.write minified, argv.output, (err)->
      if err?
        console.error err
        process.exit 1 
