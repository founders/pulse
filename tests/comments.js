var tests = []
  , async = require('async');

require('colors');

module.exports = function (next) {
  console.log('*** Testing Comments ***'.bold);

  async.series(tests, next);
};
