var tests = []
  , async = require('async')
  , request = require('supertest')
  , app = require('../app')
  , assert = require('assert')
  , CookieJar = require('./cookieJar')
  , CommentId
  , AccomplishmentId
  , UserId;

require('colors');

module.exports = function (next) {
  console.log('*** Testing Comments ***'.bold);

  async.series(tests, next);
};

tests.push(function (done) {
  console.log('Index comments without range should throw'.bold);

  request(app)
    .get('/comments')
    .expect('Content-Type', /json/)
    .expect(500)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.error, 'Cannot get comments without a range (e.g. /comments?after=<accomplishment_id>)'
        , 'There should be an error about no range');

      done();
    });
});

tests.push(function (done) {
  console.log('Index comments with bogus range should throw'.bold);

  request(app)
    .get('/comments?after=52cab2e3975e9b85b8000001')
    .expect('Content-Type', /json/)
    .expect(500)
    .end(function (err, res) {
      if(err)
        return done(err);

      console.log(res.body);

      assert.equal(res.body.error, 'Invalid accomplishment id'
        , 'There should be an error about an invalid accomplishment id');

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
      assert.ok(res.body[0].id
        , 'ID should be present');
      assert.notEqual(res.body[0].user.id, null, 'User ID should not be null');
      assert.equal(res.body[0].user.firstname, 'Bobby'
        , 'First name should be Bobby');
      assert.equal(res.body[0].user.lastname, 'McTester'
        , 'Last name should be McTester');
      assert.ok(res.body[0].updated, 'Updated should not be null');

      AccomplishmentId = res.body[0].id;
      UserId = res.body[0].user.id;

      done();
    });
});

tests.push(function (done) {
  console.log('Index comments after last accomplishment and expect zero results'.bold);

  request(app)
    .get('/comments?after=' + AccomplishmentId)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.length, 0
        , 'There should be zero results');

      done();
    });
});

tests.push(function (done) {
  console.log('Index hashtags after last accomplishment and expect one result'.bold);

  request(app)
    .get('/hashtags?after=' + AccomplishmentId)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err,res){
      console.log(res.body);
      if(err)
        return done(err);

      assert.ok(res.body.length, 1
        , 'There should be one result');

      assert.equal(res.body[0].name, 'tests'
        , 'Text should be tests');

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
        text: 'Great job on #tests'
      })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.ok(res.body.id, 'There should be an ID');

      assert.equal(res.body.text, 'Great job on #tests'
        , 'Text should be about doing a great job');
      assert.notEqual(res.body.id, null, 'ID should not be null');
      assert.equal(res.body.user_id, UserId
        , 'User ID should match original value');
      assert.ok(res.body.updated, 'Updated should not be null');

      CommentId = res.body.id;

      done();
    });
});

tests.push(function (done) {
  console.log('Index comments after last accomplishment and expect one result'.bold);

  request(app)
    .get('/comments?after=' + AccomplishmentId)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.length, 1
        , 'There should be one result');

      assert.equal(res.body[0].text, 'Great job on #tests'
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

tests.push(function (done){
  console.log('Index hashtags after last accomplishment and expect two results'.bold);

  request(app)
    .get('/hashtags?after=' + AccomplishmentId)
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err,res) {
      if(err)
        return(done(err));

      assert.equal(res.body.length, 2
        ,'There should be two results');

      assert.equal(res.body[1].name, 'tests'
        ,'Text should be tests');

      done();

    });
});
