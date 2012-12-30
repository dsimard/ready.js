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
      

