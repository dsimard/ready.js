# Install for Rails

1. `git submodule add git://github.com/dsimard/ready.js.git ready.js`
2. `cd ready.js && git submodule init && git submodule update && cd ..`
3. Create config file in *your_project/ready.conf.js* :

    { src : "./public/javascripts", 
      dest : "./public/javascripts", // the destination of your minified files
      minifiedExtension : "min", // Extension of the minified file 
      aggregateTo : "./public/javascripts/all.js", // Which file to aggregate all javascript files 
      runGCompiler : true
    }
      
4. create or open the file `your_project/.git/hooks/pre-commit` and write `node ready.js/ready.js ready.conf.js`

