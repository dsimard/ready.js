should = require '../node_modules/should'
ready = require '../lib'
cli = require './clihelper.coffee'

compile = (files, options={}, callback)->
  # Test as a lib
  ready.compile files, options, callback
  
  # Test as command-line
  cli.execute files, options, callback

describe 'Ready.js', ->
  it 'works with a valid file', ()->
    compile 'tests/simple/cat.js', (err, minified)->
      should.not.exist err
      minified.should.match /cat1/
      minified.should.not.match /cat2/
      #done()
      
  it 'works with a dir containing two files', ()->
    compile 'tests/simple', (err, minified)->
      should.not.exist err
      minified.should.match /cat1/
      minified.should.match /cat2/
      #done()
      
  it 'show error with an invalid file', ()->
    compile 'tests/not_working/dog.js', (err, minified)->
      should.exist err
      should.not.exist minified
      err.should.match /4\serrors/
      #done()
  
  it 'returns error if file doesn\'t exist', ()->
    compile '404.js', (err)->
      err.should.match /exist/
      #done()
      
  it 'is friend with recursive', ()->
    compile 'tests/mastercat', (err, minified)->
      should.not.exist err
      minified.should.match /mastercat/i
      minified.should.match /subcat/i
      #done()
      
  it 'can be non-recursive', ()->
    compile 'tests/mastercat', {recursive:false}, (err, minified)->
      should.not.exist err
      minified.should.match /mastercat/i
      minified.should.not.match /subcat/i
      #done()
      
  it 'skips jquery', ()->
    compile ['tests/jquery', 'tests/single'], 
      {ignore:'jquery*.js'}, 
      (err, minified)->
        should.not.exist err
        minified.should.match /singleCat/
        #done()
            
  it 'returns an error if there are no files to compile', ()->
    compile 'tests/jquery', 
      {ignore:'jquery*'}, 
      (err, minified)->
        should.exist err
        err.should.match /no files/
        #done()
        
  it 'returns an error if all files are ignored', ()->
    compile ['tests/jquery', 'tests/single'], 
      {ignore:['jquery*','cat.js']}, 
      (err, minified)->
        should.exist err
        err.should.match /no files/
        #done()

  it 'analyze invalid files', ()->
    compile 'tests/invalid', (err, minified)->
      should.exist err
      should.not.exist minified
      #done()
  
  it 'doesn\'t analyze files', ()->
    compile 'tests/invalid', 
      {analyze:false}, 
      (err, minified)->
        should.not.exist err
        should.exist minified
        #done()
