var tests = []
  , async = require('async')
  , request = require('supertest')
  , app = require('../app')
  , assert = require('assert');

require('colors');

module.exports = function (next) {
  console.log('*** Testing Timeline ***'.bold);

  async.series(tests, next);
};

tests.push(function (done) {
  console.log('Index timeline expect CHANGEME'.bold);

  request(app)
    .get('/timeline')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {

      if(err)
        return done(err);

      assert.equal(res.body.length, 2
        , 'There should be two results');

      assert.equal(res.body[0].text, 'I made the user tests succeed!'
        , 'Text should be about making tests succeed');
      assert.equal(res.body[0].user.firstname, 'Bobby'
        , 'First name should be Bobby');
      assert.equal(res.body[0].user.lastname, 'McTester'
        , 'Last name should be McTester');
      assert.ok(res.body[0].updated, 'Updated should not be null');

      assert.ok(res.body[1].c, 'The comment flag should be true');
      assert.equal(res.body[1].text, 'Great job!'
        , 'Text should be about doing a great job');
      assert.equal(res.body[1].user.firstname, 'Bobby'
        , 'First name should be Bobby');
      assert.equal(res.body[1].user.lastname, 'McTester'
        , 'Last name should be McTester');
      assert.ok(res.body[0].updated, 'Updated should not be null');

      done();
    });
});
