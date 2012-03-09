![alt text](http://s3.amazonaws.com/files.posterous.com/headers/2452232/scaled500.png "ready.js - continuous javascript integration")

## What does it do?
1. Check if your javascript files are valid with [jshint](http://www.jshint.com/).
2. Compile your javascript files with [Uglify JS](http://marijnhaverbeke.nl/uglifyjs).
3. Watch your javascript files for jshint while you're coding.
4. Create an aggregated file of all your javascripts.

## Installation

`npm install ready.js --global`

## Usage

    usage: 
      readyjs path/to/src path/to/dest [options] 

    options:
      -w | --watch            SRC       watch the files with JSLint in SRC
      -o | --order            FILES     specify an order (ex : --order "jquery.js, jquery.ui.js")
      -e | --exclude          FILES     exclude the FILES from JSLint and compilation (ex : -e "jquery.js")
      -compiledext            EXT       the compiled javascripts will have EXT as an extension
      -aggregateto            FILENAME  the compiled javascripts will be aggregated to this FILENAME
      
      --keep                  will keep the individual minified files
      --no-analysis           will not analyse the javascript files with jshint
      --no-compile            will not compile the javascript files with uglify-js
      --no-recursive          will not look for files recursively
      
    JsLintOptions:
      You can use any jsLint options (http://bit.ly/jslintoptions) as an argument.
      Example : readyjs /source /dest --evil --maxlen=80

    [Use a config file]
    readyjs path/to/config.file.js [options] (see http://j.mp/readyjsconfig)

## Continuous integration
1. run `npm install ready.js --global`
2. run `echo 'readyjs path/to/src path/to/dest' >> .git/hooks/pre-commit`

## Configuration file

* [Configuration options](https://github.com/dsimard/ready.js/wiki/Configuration-options)



