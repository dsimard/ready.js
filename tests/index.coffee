should = require '../node_modules/should'
ready = require '../lib'
cli = require './clihelper.coffee'
{log} = console
{inspect} = require 'util'
fs = require 'fs'
extrafs = require 'fs-extra'
path = require 'path'
fileExists = fs.exists || path.exists

deleteTestFiles = (done)->
  # Remove listeners
  ready.removeAllListeners()

  extrafs.mkdir 'tests/minified', (err)->
    extrafs.remove 'tests/minified/readyjs.json', (err)-> 
      return done(err) if err?   
      extrafs.remove 'tests/minified/all.js', (err)->    
        return done(err) if err?
        done()      

compile = (files, options={}, done, callback)->
  [callback, done, options] = [done, options, {}] unless callback?
  options.output = 'tests/minified/all.js' unless options.output?

  # Test as a lib
  ready.compile files, options, (err, minified)->
    callback err, minified
      
    # Test as command-line
    cli.execute files, options, (err, minified)->
      callback err, minified
      
      deleteTestFiles ->
        # Test as json config
        cli.optionsToJson options, (err)->
          cli.execute files, "tests/minified/readyjs.json", (err, minified)->
            callback err, minified
            done()

describe 'Ready.js', ->
  this.timeout(5000)

  beforeEach deleteTestFiles
  afterEach deleteTestFiles    

  it 'works with a valid file', (done)->
    compile 'tests/simple/cat.js', done, (err, minified)->
      should.not.exist err
      minified.should.match /cat1/
      minified.should.not.match /cat2/
      
  it 'works with a dir containing two files', (done)->
    fileCount = 0
    ready.on 'analyze', ->
      fileCount+=1
  
    compile 'tests/simple', done, (err, minified)->
      should.not.exist err
      minified.should.match /cat1/
      minified.should.match /cat2/
      fileCount.should.equal 2
      
  it 'shows error with an invalid file', (done)->
    compile 'tests/not_working/dog.js', done, (err, minified)->
      should.exist err
      should.not.exist minified
      err.should.match /4\serrors/
      #done()
  
  it 'returns error if file doesn\'t exist', (done)->
    fileCount = 0
    ready.on 'analyze', ->
      fileCount+=1  
  
    compile '404.js', done, (err)->
      err.should.match /exist/
      fileCount.should.equal 0
      
  it 'is friend with recursive', (done)->
    ready.on 'file.uglify', (file, minified)->
      minified.code.should.match /cat/i
  
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

  it 'writes all.js if output is a directory', (done)->
    compile 'tests/single', {output:'./tests/minified/'}, done, (err, minified)->
      should.not.exist err
      minified.should.match /singleCat/

  it 'can load a json for options', (done)->
    done()
    #cli.execute 'tests/simple'

  it "compile coffeescripts", (done)->
    compile 'tests/coffeescript', {output:'./tests/minified'}, done, (err, minified)->
      should.not.exist err
      minified.should.exists
      minified.should.match /"working"/
      done()
