var tests = []
  , async = require('async')
  , request = require('supertest')
  , app = require('../app')
  , assert = require('assert')
  , CookieJar = require('./CookieJar')
  , AccomplishmentId
  , UserId;

require('colors');

module.exports = function (next) {
  console.log('*** Testing Accomplishments ***'.bold);

  async.series(tests, next);
};

tests.push(function (done) {
  console.log('Index accomplishments and expect zero results'.bold);

  request(app)
    .get('/accomplishments')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.length, 1, 'There should be zero results (1 for the log)');

      done();
    });
});

tests.push(function (done) {
  console.log('Create an accomplishment'.bold);

  var req = request(app)
    .post('/accomplishments');

  req.cookies = CookieJar.jar;

  req
    .send({
        text: 'I made the user tests succeed!'
      })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.ok(res.body.id, 'There should be an ID');

      assert.equal(res.body.text, 'I made the user tests succeed!'
        , 'Text should be about making tests succeed');
      assert.notEqual(res.body.id, null, 'ID should not be null');
      assert.notEqual(res.body.user_id, null, 'User ID should not be null');

      AccomplishmentId = res.body.id;
      UserId = res.body.user_id;

      done();
    });
});

tests.push(function (done) {
  console.log('Index accomplishments and expect one result'.bold);

  request(app)
    .get('/accomplishments')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.length, 2, 'There should be one result (+1 for the log)');

      assert.equal(res.body[0].text, 'I made the user tests succeed!'
        , 'Text should be about making tests succeed');
      assert.equal(res.body[0].id, AccomplishmentId
        , 'ID should match original value');
      assert.equal(res.body[0].user.id, UserId
        , 'User ID should match original value');
      assert.equal(res.body[0].user.firstname, 'Bobby'
        , 'First name should be Bobby');
      assert.equal(res.body[0].user.lastname, 'McTester'
        , 'Last name should be McTester');

      assert.deepEqual(res.body[1]
        , [
            'Fetching from redis'
          , 'Not found in redis, reading from mongo'
          , 'Saving to redis & local cache'
          ]
        , 'The cache should have missed');

      done();
    });
});

tests.push(function (done) {
  console.log('Index accomplishments and expect one result, cached'.bold);

  request(app)
    .get('/accomplishments')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.length, 2, 'There should be one result (+1 for the log)');

      assert.equal(res.body[0].text, 'I made the user tests succeed!'
        , 'Text should be about making tests succeed');
      assert.equal(res.body[0].id, AccomplishmentId
        , 'ID should match original value');
      assert.equal(res.body[0].user.id, UserId
        , 'User ID should match original value');
      assert.equal(res.body[0].user.firstname, 'Bobby'
        , 'First name should be Bobby');
      assert.equal(res.body[0].user.lastname, 'McTester'
        , 'Last name should be McTester');


      assert.deepEqual(res.body[1]
        , [
            'Fetching from redis'
          , 'Found in redis'
          ]
        , 'The cache should have hit');

      done();
    });
});
