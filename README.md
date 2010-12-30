# Ready.js : continuous integration using jslint, nodejs and git

## What does it do?
1. Check if your javascript are valid with [jslint](http://www.jslint.com/).
2. Minify your javascript with [Closure Compiler](http://code.google.com/closure/compiler/) and your CSS or javascript with [YUI Compressor](http://developer.yahoo.com/yui/compressor/) (optimize and minify your code).
3. Watch your javascript files for jslint while you're coding.
4. Create an aggregated file of all your javascripts / CSS.

## Prerequesites 

Install [git](http://git-scm.com/) and [node.js](http://nodejs.org/#download).

## How to install in your project (for git)

1. run `git submodule add git://github.com/dsimard/ready.js.git ready.js`
2. run `cd ready.js && git submodule init && git submodule update && cd ..`
3. Create config file in *your_project/ready.conf.js* :

        { src : "./javascripts", dest : "./minified" }
      
4. run `echo 'node ready.js/bin/ready.js ready.conf.js' >> .git/hooks/pre-commit`

Then, **every time you commit**, ready.js will be run.

## How to watch your javascript files for errors with jslint

run `node ready.js/bin/ready.watch.js ready.conf.js`

## Want to know more?

* [Alternatives installations](http://github.com/dsimard/ready.js/wiki)
* [Configuration options](https://github.com/dsimard/ready.js/wiki/Configuration-options)
* [FAQ](https://github.com/dsimard/ready.js/wiki/FAQ)



