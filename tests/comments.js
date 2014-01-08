var tests = []
  , async = require('async')
  , request = require('supertest')
  , app = require('../app')
  , assert = require('assert')
  , CookieJar = require('./cookieJar')
  , CommentId
  , UserId;

require('colors');

module.exports = function (next) {
  console.log('*** Testing Comments ***'.bold);

  async.series(tests, next);
};

tests.push(function (done) {
  console.log('Index comments and expect zero results'.bold);

  request(app)
    .get('/comments')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.length, 0, 'There should be zero results');

      done();
    });
});

tests.push(function (done) {
  console.log('Create an comment'.bold);

  var req = request(app)
    .post('/comments');

  req.cookies = CookieJar.jar;

  req
    .send({
        text: 'Great job!'
      })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.ok(res.body.id, 'There should be an ID');

      assert.equal(res.body.text, 'Great job!'
        , 'Text should be about doing a great job');
      assert.notEqual(res.body.id, null, 'ID should not be null');
      assert.notEqual(res.body.user_id, null, 'User ID should not be null');
      assert.ok(res.body.updated, 'Updated should not be null');

      CommentId = res.body.id;
      UserId = res.body.user_id;

      done();
    });
});

tests.push(function (done) {
  console.log('Index comments and expect one result'.bold);

  request(app)
    .get('/comments')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.length, 1, 'There should be one result');

      assert.equal(res.body[0].text, 'Great job!'
        , 'Text should be about doing a great job');
      assert.equal(res.body[0].id, CommentId
        , 'ID should match original value');
      assert.equal(res.body[0].user.id, UserId
        , 'User ID should match original value');
      assert.equal(res.body[0].user.firstname, 'Bobby'
        , 'First name should be Bobby');
      assert.equal(res.body[0].user.lastname, 'McTester'
        , 'Last name should be McTester');
      assert.ok(res.body[0].updated, 'Updated should not be null');

      done();
    });
});
