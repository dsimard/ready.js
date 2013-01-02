should = require '../node_modules/should'
ready = require '../lib'

describe 'Ready.js', ->
  it 'works with a valid file', (done)->
    ready.compile 'tests/simple/cat.js', (err, minified)->
      should.not.exist err
      minified.should.match /cat1/
      minified.should.not.match /cat2/
      done()
      
  it 'works with a dir containing two files', (done)->
    ready.compile 'tests/simple', (err, minified)->
      should.not.exist err
      minified.should.match /cat1/
      minified.should.match /cat2/
      done()
      
  it 'show error with an invalid file', (done)->
    ready.compile 'tests/not_working/dog.js', (err, minified)->
      should.exist err
      should.not.exist minified
      err.should.match /4\serrors/
      done()
  
  it 'returns error if file doesn\'t exist', (done)->
    ready.compile '404.js', (err)->
      err.should.match /exist/
      done()
      
  it 'is friend with recursive', (done)->
    ready.compile 'tests/mastercat', (err, minified)->
      should.not.exist err
      minified.should.match /mastercat/i
      minified.should.match /subcat/i
      done()
      
  it 'can be non-recursive', (done)->
    ready.compile 'tests/mastercat', {recursive:false}, (err, minified)->
      should.not.exist err
      minified.should.match /mastercat/i
      minified.should.not.match /subcat/i
      done()
      
  it 'skips jquery', (done)->
    ready.compile ['tests/jquery', 'tests/single'], 
      {ignore:'jquery*.js'}, 
      (err, minified)->
        should.not.exist err
        minified.should.match /singleCat/
        done()
            
  it 'returns an error if there are no files to compile', (done)->
    ready.compile 'tests/jquery', 
      {ignore:'jquery*'}, 
      (err, minified)->
        should.exist err
        err.should.match /no files/
        done()
        
  it 'returns an error if all files are ignored', (done)->
    ready.compile ['tests/jquery', 'tests/single'], 
      {ignore:['jquery*','cat.js']}, 
      (err, minified)->
        should.exist err
        err.should.match /no files/
        done()
