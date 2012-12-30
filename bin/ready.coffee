#!/usr/bin/env coffee
{argv} = require 'optimist'
{dir} = console
ready = require '../lib/'

ready.compile argv._, (err)->
  # If there was an error in the compiled file, show and exit
  if err?
    console.error err
    process.exit 1
