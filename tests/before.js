var tests = []
  , request = require('supertest')
  , async = require('async')
  , assert = require('assert')
  , app = require('../app');

require('colors');

module.exports = function (done) {
  console.log('*** Starting Tests ***'.bold);
  async.series(tests, done);
};

tests.push(function (done) {
  console.log('Reset database'.bold);

  request(app)
    .get('/reset')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      console.log(res.body);
      if(err)
        return done(err);

      assert.equal(res.body.log.length, 4, 'There should be four dropped collections');

      done();
    });
});
