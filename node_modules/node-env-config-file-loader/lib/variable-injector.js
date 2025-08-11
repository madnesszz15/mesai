var _ = require('lodash');

exports.inject = function(contents) {
  var re = /\#\{(.*?)\}/g;
  var matches;
  var result = contents;

  do {
    matches = re.exec(result);

    if (matches) {
      result = _.replace(result, matches[0], process.env[matches[1]]);
    }
  } while (matches);

  return result;
};
