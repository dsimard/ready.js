#!/usr/bin/env coffee
{dir, log} = console
{inspect} = require 'util'
path = require 'path'
fs = require 'fs'
extrafs = require '../node_modules/fs-extra'
ready = require '../lib/'
output = require '../lib/output'

optimist = require('optimist')
  .usage('\nUsage: $0 [FILES OR DIRECTORIES] [options]')
  .options('o', {alias:'output'})
  .describe('o', 'The file or directory in which to write the output')
  .option('c', {alias:'config'})
  .describe('c', 'Specify a config.json file')
  .options('i', {alias:'ignore'})
  .describe('i', 'Ignore these files from JSHint but output them in the aggregated file')
  .options('k', {alias:'keep'})
  .describe('k', 'Keep individual minified files')
  .describe('no-recursive', 'Don\'t recurse in sub-directories')
  .options('h', {alias:'help'})
  .describe('h', 'Display this help')
  .options('v', {alias:'version'})
  .describe('v', 'Display the current version')

argv = optimist.argv

# Display version
if argv.v?
  extrafs.readJSONFile './package.json', (err, pack)->
    log pack.version
  return

return optimist.showHelp() if argv._.length == 0 || argv.help?

# Create an array with ignore list
argv.ignore = argv.ignore.split(' ') if argv.ignore?
argv.i = argv.ignore

# If should keep individual files
if argv.k and argv.o
  ready.on 'file.uglify', (file, uglify)->
    minFilename = path.basename(file).replace /\.js$/, '.min.js'
    output.writeToDir uglify.code, minFilename, argv, (err)->
      if err?
        console.error err
        process.exit 1
        
# Override argv with a config file
if argv.c?
  argv_ = argv._
  config = fs.readFileSync argv.c
  argv = JSON.parse config
  argv._ = argv_
       
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
