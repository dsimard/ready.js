---
layout: main
title: Configuration file
---
You can use a configuration file for your projects which make it easier to launch ready.js with the same configuration. Just create a .json (ex : `config.json`) and call it that way :

    readyjs ./config.json

These are the options you can use in your config file :

    {
      dest : "./compiled", // the destination of your minified files
      compiledExtension : "min", // extension of the minified file
      analyse : true, // if should analyse the files with jshint
      compile : true, // if should run the compiler
      keepCompiled : false, // if should keep the minified files
      aggregateTo : "all.js", // If a string is specified, all the .js will be aggregated to this file in the config.dest      
      order : [], // The order of aggregation (example : we want jquery before jquery.ui) Must not specified every file.
      exclude : [], // Files that are not compiled but still aggregated
      recursive : true, // Should look for javascript recursively
      test : false, // If it's running from test environment
      analysisOptions: {} // Options for the analysis (jshint)
    }



### src
_string_ (default "./") : the source directory containing the javascript files.

### dest
_string_ (default "./compiled"): The destination directory were to send compiled javascripts and the aggregated file.

### keepCompiled
_boolean_ (default false) : If it should keep every compiled file in the destination directory.

### aggregateTo
_string_ (default "all.js") : The name of the file that every compiled javascript file must be aggregated to.

### compiledExtension
_string_ (default "min") : The extension for the compiled files.

### analyse
_boolean_ (default true) : If should analyse with jshint.

### compile
_boolean_ (default true) : If should compile with Uglify.

### order
_array of string_ (default empty) : The order in which to aggregate every compiled files to respect dependencies. Example, you may want to have _jquery.js_ before _jquery-ui.js_.

### exclude
_array of string_ (default empty) : A list of files that are not JSLinted or compiled but still aggregated. If you have _jquery-min.js_, you probably don't want to check and compile it.

### recursive
_boolean_ (default true) : Look for javascript recursively

### debug
_boolean_ (default false) : If in debug mode.
