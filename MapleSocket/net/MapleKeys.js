var request = require("request");

var keys = {};

request({
  url : "http://craftnet.nl/app_updates/get_keys.php?version=4&as_json&arrays_without_useless_bytes",
  json : true
}, function(error, response, body) {
  keys = body;
});

module.exports.getKey = function(locale, version, subversion) {
  if (!keys[locale]) {
    return null;
  }
  if (!keys[locale][version]) {
    return null;
  }
  for (var i = subversion; i > 0; i--) {
    if (keys[locale][version][i]) {
      return new Buffer(keys[locale][version][i]);
    }
  }

  return null;
};
