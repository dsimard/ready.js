should = require '../node_modules/should'
listFiles = require '../lib/listfiles'

describe 'List files,', ->
  describe 'source to file', ->
    it 'works with a single file', (done)->
      listFiles.sourceToFiles './tests/simple/cat.js', (err, files)->
        should.not.exist err
        files.length.should.equal 1
        done()
        
    it 'errors with a non-existing file', (done)->
      listFiles.sourceToFiles '404.js', (err, files)->
        should.exist err
        err.should.match /exist/
        should.not.exist files
        done()

    it 'works with a directory', (done)->
      listFiles.sourceToFiles './tests/simple', (err, files)->
        should.not.exist err
        should.exist files
        files.length.should.equal 2
        done()

    it 'returns coffeescript', (done)->
      listFiles.sourceToFiles './tests/coffeescript', (err, files)->
        should.not.exist err
        files.length.should.equal 2
        done()
        
  describe 'sourceS to file', ->
    it 'works with a single file', (done)->
      listFiles.sourcesToFiles './tests/simple/cat.js', (err, files)->
        should.not.exist err
        files.length.should.equal 1
        done()
        
    it 'errors with a non-existing file', (done)->
      listFiles.sourcesToFiles '404.js', (err, files)->
        should.exist err
        err.should.match /exist/
        should.not.exist files
        done()

    it 'works with a directory', (done)->
      listFiles.sourcesToFiles './tests/simple', (err, files)->
        should.not.exist err
        should.exist files
        files.length.should.equal 2
        done()
        
    it 'works with a file and a directory', (done)->
      listFiles.sourcesToFiles ['./tests/single/cat.js', './tests/simple'], (err, files)->
        should.not.exists err
        files.length.should.equal 3
        done()
        
    it 'files are unique', (done)->
      listFiles.sourcesToFiles ['./tests/single', './tests/single'], (err, files)->
        should.not.exists err
        files.length.should.equal 1
        done()
        
    it 'works with two directories', (done)->
      listFiles.sourcesToFiles ['./tests/single/', './tests/simple'], (err, files)->
        should.not.exists err
        files.length.should.equal 3
        done()
        
    it 'ignores files even if it\'s a js file', (done)->
      listFiles.sourcesToFiles ['./tests/single', './tests/jquery'], 
        {ignore:'jquery*.js'}
        (err, files)->
          should.not.exists err
          files.length.should.equal 1
          done()
