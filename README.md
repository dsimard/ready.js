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

## What you need?

Install [git](http://git-scm.com/) and [node.js](http://nodejs.org/#download).

## Why not using gems?

I don't like to have external dependencies. I mean [http://rubygems.org/](gems) are cool 
but for something that simple, it's an overkill. Plus, I didn't want to tie *ready.js* to
the Rails or the node community. You can use it for any project that has javascript
files in it, which mean 99.97% of web projects alive today.

## Why not using *Google Closure Compiler* jar file?
I could have used it but it's in java and because I want the minimum external dependency, 
I could use it. In fact, I never installed java on my dev machine and probably never will, 
I'm afraid it could break things (and probably would).

## Why using node.js?
Because I really wanted to try working with it.

