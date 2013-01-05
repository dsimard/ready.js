path = require 'path'
extrafs = require '../node_modules/fs-extra'

module.exports = (callback)->
  extrafs.readJSONFile path.join(__dirname, "../", "package.json"), (err, pack)->
    callback(pack.version)

