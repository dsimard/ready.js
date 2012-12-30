should = require '../node_modules/should'
ready = require '../lib'

describe 'Simple', ->
  it 'works with a valid file', ->
    ready.compile 'tests/simple/cat.js', (err)->
      should.not.exist err
      
  it 'show error with an invalid file', ->
    ready.compile 'tests/simple/dog.js', (err)->
      should.exist err
      err.should.match /4\serrors/
  
  it 'returns error if file doesn\'t exist', ()->
    ready.compile '404.js', (err)->
      err.should.match /exist/
      
describe 'Source(s) to files', ->
  it 'works with a single file', (done)->
    ready.sourceToFile './tests/simple/cat.js', (err, files)->
      should.not.exist err
      files.length.should.equal 1
      done()
      
  it 'errors with a non-existing file', (done)->
    ready.sourceToFile '404.js', (err, files)->
      should.exist err
      should.not.exist files
      done()
###
  if 'works with a directory', (done)->
    ready.sourceToFile './tests/simple', (err, files)->
###
      
