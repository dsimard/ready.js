![alt text](http://s3.amazonaws.com/files.posterous.com/headers/2452232/scaled500.png "ready.js - continuous javascript integration")
[![Build Status](https://travis-ci.org/dsimard/ready.js.png?branch=2012-12-30_v3.0)](https://travis-ci.org/dsimard/ready.js)

## What does it do?
1. Check if your javascript files are valid with [jshint](http://www.jshint.com/).
2. Compile your javascript files with [Uglify JS](http://marijnhaverbeke.nl/uglifyjs).
3. _(Later)_ Watch your javascript files for jshint while you're coding.
4. Create an aggregated file of all your javascripts.

## Installation

`npm install ready.js --global`

## Usage

    Usage: readyjs [FILES OR DIRECTORIES] [options]

    Options:
      -o, --output    The file or directory in which to write the output                                
      -c, --config    Specify a config.json file                                           
      -i, --ignore    Ignore these files from JSHint but output them in the aggregated file
      -k, --keep      Keep individual minified files                                       
      --no-recursive  Don't recurse in sub-directories                                     
      -h, --help      Display this help                                                    
      -v, --version   Display the current version  

## Continuous integration
1. run `npm install ready.js --global`
2. run `echo 'readyjs path/to/src -o path/to/dest' >> .git/hooks/pre-commit`

## Configuration file

You can use a configuration file with ready.js. It has to be a JSON with that format :

    {
      "output" : "path/to/destination", // The file in which to write the output
      "ignore" : [], // Ignore these files from JSHint but output them in the aggregated file
      "keep" : false, // Keep individual minified files
      "no-recursive" : false // Don't recurse in sub-directories
    }



