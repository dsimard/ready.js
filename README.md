# Ready.js : continuous javascript integration

## What does it do?
1. Check if your javascript are valid with [jslint](http://www.jslint.com/).
2. Minify your javascript with [Closure Compiler](http://code.google.com/closure/compiler/) (optimize and minify your code).
3. Watch your javascript files for jslint while you're coding.
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
      -i | --installcompiler  PATH      install the google compiler specified by PATH
      -compiledext            EXT       the compiled javascripts will have EXT as an extension
      -aggregateto            FILENAME  the compiled javascripts will be aggregated to this FILENAME
      
      --keep                  will keep the individual minified files
      --nojslint              will not run JSLint
      --nocompiler            will not run the compiler
      --norecursive           will not look for files recursively
      
    JsLintOptions:
      You can use any jsLint options (http://bit.ly/jslintoptions) as an argument.
      Example : readyjs /source /dest --evil --maxlen=80

    [Use a config file]
    readyjs path/to/config.file.js [options] (see http://j.mp/readyjsconfig)

## Continuous integration
1. run `npm install ready.js`
2. run `echo 'readyjs path/to/src path/to/dest' >> .git/hooks/pre-commit`

## Want to know more?

* [Alternatives installations](http://github.com/dsimard/ready.js/wiki)
* [Configuration options](https://github.com/dsimard/ready.js/wiki/Configuration-options)
* [FAQ](https://github.com/dsimard/ready.js/wiki/FAQ)



