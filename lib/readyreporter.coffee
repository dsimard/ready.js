{inspect} = require 'util'
_ = require 'underscore'

# Format jshint errors (see <https://github.com/jshint/jshint/tree/master/src/reporters>)
reporter = (filename, errors)->
  message = ["#{errors.length} error#{if errors.length > 1 then 's' else ''} in '#{filename}'\n"]

  errors = _.compact(errors).map (e)->
    line = if e.line? && e.character? then "#{e.line}:#{e.character} : " else ""
    "#{line}#{e.reason}"
  
  message.concat(errors).join '\n'
  
module.exports = {reporter:reporter}
