var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var variableInjector = require('./variable-injector');

exports.load = function(filename) {
  var contents = fs.readFileSync(filename);
  var injectedContents = variableInjector.inject(contents);
  var extension = path.extname(filename);

  switch (extension) {
    case '.json':
      return JSON.parse(injectedContents);
    case '.yaml':
    case '.yml':
      return yaml.safeLoad(injectedContents);
    default:
      throw new Error('File type is not supported');
  }
};
