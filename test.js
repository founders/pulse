process.env.NODE_ENV = 'testing';

var tests = [
    require('./tests/before')
  , require('./tests/users')
  , require('./tests/accomplishments')
  , require('./tests/comments')
  , require('./tests/after')
  ]
, async = require('async');

require('colors');

async.series(tests, function (err) {
  if(err) {
    console.error('*** Tests failed ***'.red);
    console.trace(err);
    process.exit(1);
  }
  else {
    console.log('*** All tests successfully passed ***'.green);
    process.exit(0);
  }
});
