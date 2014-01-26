var tests = []
  , async = require('async')
  , request = require('supertest')
  , app = require('../app')
  , assert = require('assert')
  , CookieJar = require('./cookieJar')
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

      assert.equal(res.body.length, 0, 'There should be zero results');

      done();
    });
});

tests.push(function (done){
  console.log('Testing for zero hashtags'.bold);

  request(app)
    .get('/hashtags')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err,res){
      if(err)
        return done(err);

      assert.equal(res.body.length, 0, 'There should be zero results');

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
        text: 'I made the user #tests succeed!'
      })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.ok(res.body.id, 'There should be an ID');

      assert.equal(res.body.text, 'I made the user #tests succeed!'
        , 'Text should be about making tests succeed');
      assert.notEqual(res.body.id, null, 'ID should not be null');
      assert.notEqual(res.body.user_id, null, 'User ID should not be null');
      assert.ok(res.body.updated, 'Updated should not be null');

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

      assert.equal(res.body.length, 1, 'There should be one result');

      assert.equal(res.body[0].text, 'I made the user #tests succeed!'
        , 'Text should be about making tests succeed');
      assert.equal(res.body[0].id, AccomplishmentId
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

tests.push(function (done) {
  console.log('Checking hashtags'.bold);

  request(app)
    .get('/hashtags')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {

      if(err)
        return done(err);

      assert.equal(res.body.length, 1, 'There should be one result');

      assert.equal(res.body[0].name, 'tests'
        , 'Text should be tests');
      assert.ok(res.body[0].id
        , 'ID should not be null');

      done();
    });
});