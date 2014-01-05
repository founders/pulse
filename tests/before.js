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
      if(err)
        return done(err);

      assert.equal(res.body.log.length, 3, 'There should be three dropped collections');

      done();
    });
});
