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
    
## Contribute

Give what you want to contribute to open-source : 

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_paynowCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5Q2QAJSHP8Y8Y)

You can create [issues](https://github.com/dsimard/ready.js/issues).

You can also contribute code :

1. Fork the code on GitHub
2. Clone your fork in your environment : `git clone git@github.com:USERNAME/undone.git`
3. Create a branch for your feature : `git checkout -b your_branch_name`
4. Write and delete code and commit as often as you can : `git commit -am "A descriptive message"`
5. Push the branch to your fork : `git push origin your_branch_name`
6. Create a pull request on GitHub (click the __Pull request__ button on your fork page)

## Need more help?

- Create an [issue](https://github.com/dsimard/ready.js/issues).
- Write me an email at <dsimard@azanka.ca>



