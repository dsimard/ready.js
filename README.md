# Ready.js : continuous integration using jslint and node

## What does it do?
1. Check if your javascript are valid with [jslint](http://www.jslint.com/).
2. Minify your javascript with [Closure Compiler](http://code.google.com/closure/compiler/) (optimize and minify your code).
3. Watch your javascript files for jslint while you're coding.
4. Create an aggregated file of all your javascripts.

## Installation

`npm install ready.js`

## Usage

### readyjs
By typing `readyjs path/to/src path/to/dest`, _ready.js_ will compile all your javascript files 
from _src_ to your _dest_ directory.

    usage: 
      readyjs path/to/src path/to/dest [options] 
      - or -
      readyjs path/to/config/file [options]

    options:
      -s | --src      SRC       the source of javascript files
      -d | --dest     DEST      the destination of compiled javascript files
      -w | --watch    SRC       watch the files with JSLint in SRC
      -o | --order    FILES     specify an order (ex : --order "jquery.js, jquery.ui.js")
      -e | --exclude  FILES     exclude the FILES from JSLint and compilation (ex : -e "jquery.js")
      -compiledext    EXT       the compiled javascripts will have EXT as an extension
      -aggregateto    FILENAME  the compiled javascripts will be aggregated to this FILENAME
      
      --keep                  will keep the individual minified files
      --nojslint              will not run JSLint
      --nocompiler            will not run the compiler
      --norecursive           will not look for files recursively

You can also use a [configuration file](https://github.com/dsimard/ready.js/wiki/Configuration-options) like this : `readyjs config.file.js`


## Install offline Google Closure Compiler
If you want to use your own [compiler](http://code.google.com/closure/compiler/) :

1. [Download it](http://closure-compiler.googlecode.com/files/compiler-latest.zip)
2. run `readyjs --installcompiler path/to/compiler.jar`


## Continuous integration
1. run `npm install ready.js`
2. run `echo 'readyjs path/to/src path/to/dest' >> .git/hooks/pre-commit`


## Want to know more?

* [Alternatives installations](http://github.com/dsimard/ready.js/wiki)
* [Configuration options](https://github.com/dsimard/ready.js/wiki/Configuration-options)
* [FAQ](https://github.com/dsimard/ready.js/wiki/FAQ)



