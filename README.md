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
By typing `readyjs --src path/to/js/directory --dest path/to/compiled/directory`, _ready.js_ will
compile all your javascript files from _src_ to your _dest_ directory.

You can also use a [configuration file](https://github.com/dsimard/ready.js/wiki/Configuration-options) like this : `readyjs config.file.js`

### watchjs
By typing `watchjs config.file.js`, _ready.js_ will run **JSLint** on your javascript files
accordingly to the options set in your configuration file.

## Install offline Google Closure Compiler
If you want to use your own [compiler](http://code.google.com/closure/compiler/) :

1. [Download it](http://closure-compiler.googlecode.com/files/compiler-latest.zip)
2. run `readyjs --installcompiler path/to/compiler.jar`


## Continuous integration
1. run `npm install ready.js`
2. run `echo 'readyjs --src path/to/src --dest path/to/dest' >> .git/hooks/pre-commit`

Then, **every time you commit**, ready.js will be run.

## Want to know more?

* [Alternatives installations](http://github.com/dsimard/ready.js/wiki)
* [Configuration options](https://github.com/dsimard/ready.js/wiki/Configuration-options)
* [FAQ](https://github.com/dsimard/ready.js/wiki/FAQ)



