should = require '../node_modules/should'
ready = require '../lib'
cli = require './clihelper.coffee'
{log} = console
{inspect} = require 'util'
fs = require 'fs'
path = require 'path'
fileExists = fs.exists || path.exists

deleteTestFiles = (done)->
  fileExists 'tests/all.js', (exists)->
    if exists
      fs.unlink 'tests/all.js', (err)->
        done()
    else
      done()

compile = (files, options={}, done, callback)->
  [callback, done, options] = [done, options, {}] unless callback?
  options.output = 'tests/all.js' unless options.output?

  # Test as a lib
  ready.compile files, options, (err, minified)->
    callback err, minified
      
    # Test as command-line
    cli.execute files, options, (err, minified)->
      callback err, minified
      done()

describe 'Ready.js', ->
  beforeEach deleteTestFiles
  afterEach deleteTestFiles    

  it 'works with a valid file', (done)->
    compile 'tests/simple/cat.js', done, (err, minified)->
      should.not.exist err
      minified.should.match /cat1/
      minified.should.not.match /cat2/
      
  it 'works with a dir containing two files', (done)->
    compile 'tests/simple', done, (err, minified)->
      should.not.exist err
      minified.should.match /cat1/
      minified.should.match /cat2/
      #done()
      
  it 'shows error with an invalid file', (done)->
    compile 'tests/not_working/dog.js', done, (err, minified)->
      should.exist err
      should.not.exist minified
      err.should.match /4\serrors/
      #done()
  
  it 'returns error if file doesn\'t exist', (done)->
    compile '404.js', done, (err)->
      err.should.match /exist/
      #done()
      
  it 'is friend with recursive', (done)->
    compile 'tests/mastercat', done, (err, minified)->
      should.not.exist err
      minified.should.match /mastercat/i
      minified.should.match /subcat/i
      #done()
      
  it 'can be non-recursive', (done)->
    compile 'tests/mastercat', {recursive:false}, done, (err, minified)->
      should.not.exist err
      minified.should.match /mastercat/i
      minified.should.not.match /subcat/i
      #done()
      
  it 'skips jquery', (done)->
    compile ['tests/jquery', 'tests/single'], 
      {ignore:'jquery*.js'}, 
      done,
      (err, minified)->
        should.not.exist err
        minified.should.match /singleCat/
        #done()
            
  it 'returns an error if there are no files to compile', (done)->
    compile 'tests/jquery', 
      {ignore:'jquery*'}, 
      done,
      (err, minified)->
        should.not.exist err
        minified.should.match /jQuery/
        
  it 'returns an error if all files are ignored', (done)->
    compile ['tests/jquery', 'tests/single'], 
      {ignore:['jquery*','cat.js']}, 
      done,
      (err, minified)->
        should.not.exist err
        minified.should.match /jQuery/
        minified.should.match /singleCat/
        #done()

  it 'analyze invalid files', (done)->
    compile 'tests/invalid', done, (err, minified)->
      should.exist err
      should.not.exist minified
      #done()
  
  it 'doesn\'t analyze files', (done)->
    compile 'tests/invalid', 
      {analyze:false}, 
      done,
      (err, minified)->
        should.not.exist err
        should.exist minified
        #done()
        
  it 'throws an error on empty directory', (done)->
    compile 'tests/empty', done, (err, minified)->
      should.exist err
      err.should.match /no file/
      
  it 'outputs all.js if output is a directory', (done)->
    compile 'tests/simple', {output:'./tests/'}, done, (err, minified)->
      should.exist err
      err.should.match /no file/
