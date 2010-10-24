# Ready.js

## What does it do?
1. Check if your javascript are valid with [jslint](http://www.jslint.com/).
2. Minify your javascript with [Closure Compiler](http://code.google.com/closure/compiler/) (optimize and minify your code).

## How to install in your project (for Git)
1. `git submodule add git://github.com/dsimard/ready.js.git ready.js`
2. `cd ready.js && git submodule init && git submodule update && cd ..`
3. Create config file in *your_project/ready.conf.js* :

        { src : "./", // the source dir of js files
          dest : "./", // the destination of your minified files
          minifiedExtension : "min" // Extension of the minified file }
      
4. create or open the file `your_project/.git/hooks/pre-commit` and write `node ready.js/ready.js ready.conf.js`

Then, **every time you commit**, ready.js will be run.
