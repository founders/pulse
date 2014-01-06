var tests = []
  , async = require('async')
  , request = require('supertest')
  , app = require('../app')
  , assert = require('assert')
  , CookieJar = require('./cookieJar')
  , UserId
  , AltUserId;

require('colors');

module.exports = function (done) {
  console.log('*** Testing Users ***'.bold);
  async.series(tests, done);
};

tests.push(function (done) {
  console.log('Index users and expect zero results'.bold);

  request(app)
    .get('/users')
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
  console.log('Creating a user with too short a name should fail'.bold);

  request(app)
    .post('/users')
    .send({
        firstname: 'B'
      , lastname: 'Afraid'
      , email: 'bob@illinois.edu'
      , password: 'entreprenerdparty'
      })
    .expect('Content-Type', /json/)
    .expect(500)
    .end(function (err, res) {
      if(err)
        return done(err);

      console.log(res.body);

      done();
    });
});

tests.push(function (done) {
  console.log('Create a user'.bold);

  request(app)
    .post('/users')
    .send({
        firstname: 'Bobby'
      , lastname: 'McTester'
      , email: 'bob@illinois.edu'
      , password: 'entreprenerdparty'
      })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.ok(res.body.id, 'There should be an ID');

      UserId = res.body.id;

      assert.equal(res.body.firstname, 'Bobby', 'First name should be Bobby');
      assert.equal(res.body.lastname, 'McTester', 'Last name should be McTester');
      assert.equal(res.body.email, 'bob@illinois.edu', 'Email should be bob@illinois.edu');
      assert.strictEqual(res.body.salt, undefined, 'Salt should be undefined');
      assert.strictEqual(res.body.hash, undefined, 'Hash should be undefined');

      CookieJar.jar = res.headers['set-cookie'].pop().split(';')[0];

      done();
    });
});

tests.push(function (done) {
  console.log('Creating a duplicate user should fail'.bold);

  request(app)
    .post('/users')
    .send({
        firstname: 'Bobby'
      , lastname: 'McTester'
      , email: 'bob@illinois.edu'
      , password: 'entreprenerdparty'
      })
    .expect('Content-Type', /json/)
    .expect(500)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.error, 'The email already exists in the system'
        , 'The error should say the email already exists');

      done();
    });
});

tests.push(function (done) {
  console.log('View user when logged in'.bold);

  var req = request(app)
    .get('/users/' + UserId);

  req.cookies = CookieJar.jar;

  req
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.id, UserId, 'Id should match saved value');
      assert.equal(res.body.firstname, 'Bobby', 'First name should be Bobby');
      assert.equal(res.body.lastname, 'McTester', 'Last name should be McTester');
      assert.equal(res.body.email, 'bob@illinois.edu', 'Email should be bob@illinois.edu');
      assert.strictEqual(res.body.salt, undefined, 'Salt should be undefined');
      assert.strictEqual(res.body.hash, undefined, 'Hash should be undefined');

      done();
    });
});

tests.push(function (done) {
  console.log('Index users and expect one result'.bold);

  var req = request(app)
    .get('/users');

  req.cookies = CookieJar.jar;

  req
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.length, 1, 'There should be one result');

      assert.equal(res.body[0].id, UserId, 'Id should match saved value');
      assert.equal(res.body[0].firstname, 'Bobby', 'First name should be Bobby');
      assert.equal(res.body[0].lastname, 'McTester', 'Last name should be McTester');
      assert.equal(res.body[0].email, 'bob@illinois.edu', 'Email should be bob@illinois.edu');
      assert.strictEqual(res.body[0].password, undefined, 'Password should be undefined');
      assert.strictEqual(res.body[0].hash, undefined, 'Hash should be undefined');

      done();
    });
});

tests.push(function (done) {
  console.log('Log out from site'.bold);

  var req = request(app)
    .post('/logout');

  req.cookies = CookieJar.jar;

  req
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.deepEqual(res.body, {}, 'There should be an empty response');

      CookieJar.jar = res.headers['set-cookie'].pop().split(';')[0];

      done();
    });
});

tests.push(function (done) {
  console.log('Viewing user when logged out should be forbidden'.bold);

  var req = request(app)
    .get('/users/' + UserId);

  req.cookies = CookieJar.jar;

  req
    .expect('Content-Type', /json/)
    .expect(403)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.error, 'Not authenticated'
        , 'The error should be about not being authenticated');

      done();
    });
});

tests.push(function (done) {
  console.log('Log in with incorrect email'.bold);

  request(app)
    .post('/login')
    .send({
        email: 'fake@site.com'
      , password: 'entreprenerdparty'
      })
    .expect('Content-Type', /json/)
    .expect(403)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.error, 'Email address is not registered'
        , 'The error should be an incorrect email');

      done();
    });
});

tests.push(function (done) {
  console.log('Log in with incorrect password'.bold);

  request(app)
    .post('/login')
    .send({
        email: 'bob@illinois.edu'
      , password: 'bogus'
      })
    .expect('Content-Type', /json/)
    .expect(403)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.error, 'Incorrect password'
        , 'The error should be an incorrect password');

      done();
    });
});

tests.push(function (done) {
  console.log('Log in as the new user'.bold);

  request(app)
    .post('/login')
    .send({
        email: 'bob@illinois.edu'
      , password: 'entreprenerdparty'
      })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.id, UserId, 'Id should match saved value');
      assert.equal(res.body.firstname, 'Bobby', 'First name should be Bobby');
      assert.equal(res.body.lastname, 'McTester', 'Last name should be McTester');
      assert.equal(res.body.email, 'bob@illinois.edu', 'Email should be bob@illinois.edu');
      assert.strictEqual(res.body.salt, undefined, 'Salt should be undefined');
      assert.strictEqual(res.body.hash, undefined, 'Hash should be undefined');

      CookieJar.jar = res.headers['set-cookie'].pop().split(';')[0];

      done();
    });
});

tests.push(function (done) {
  console.log('View user when logged in'.bold);

  var req = request(app)
    .get('/users/' + UserId);

  req.cookies = CookieJar.jar;

  req
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.id, UserId, 'Id should match saved value');
      assert.equal(res.body.firstname, 'Bobby', 'First name should be Bobby');
      assert.equal(res.body.lastname, 'McTester', 'Last name should be McTester');
      assert.equal(res.body.email, 'bob@illinois.edu', 'Email should be bob@illinois.edu');
      assert.strictEqual(res.body.salt, undefined, 'Salt should be undefined');
      assert.strictEqual(res.body.hash, undefined, 'Hash should be undefined');

      done();
    });
});

tests.push(function (done) {
  console.log('Create another user'.bold);

  request(app)
    .post('/users')
    .send({
        firstname: 'Charlie'
      , lastname: 'McTester'
      , email: 'charlie@illinois.edu'
      , password: 'moocows'
      })
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.ok(res.body.id, 'There should be an ID');

      AltUserId = res.body.id;

      assert.equal(res.body.firstname, 'Charlie', 'First name should be Charlie');
      assert.equal(res.body.lastname, 'McTester', 'Last name should be McTester');
      assert.equal(res.body.email, 'charlie@illinois.edu'
        , 'Email should be charlie@illinois.edu');
      assert.strictEqual(res.body.salt, undefined, 'Salt should be undefined');
      assert.strictEqual(res.body.hash, undefined, 'Hash should be undefined');

      done();
    });
});

tests.push(function (done) {
  console.log('View another user when logged in should not reveal email'.bold);

  var req = request(app)
    .get('/users/' + AltUserId);

  req.cookies = CookieJar.jar;

  req
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.firstname, 'Charlie', 'First name should be Charlie');
      assert.equal(res.body.lastname, 'McTester', 'Last name should be McTester');
      assert.strictEqual(res.body.email, undefined, 'Email should be undefined');
      assert.strictEqual(res.body.salt, undefined, 'Salt should be undefined');
      assert.strictEqual(res.body.hash, undefined, 'Hash should be undefined');

      done();
    });
});

tests.push(function (done) {
  console.log('Whois Ben should get his details'.bold);

  request(app)
    .get('/whois/kbng2')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.firstname, 'Benjamin', 'First name should be Benjamin');
      assert.equal(res.body.lastname, 'Ng', 'Last name should be Ng');

      done();
    });
});

tests.push(function (done) {
  console.log('Whois John should get his details'.bold);

  request(app)
    .get('/whois/quarton')
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if(err)
        return done(err);

      assert.equal(res.body.firstname, 'John', 'First name should be John');
      assert.equal(res.body.lastname, 'Quarton', 'Last name should be Quarton');

      done();
    });
});

tests.push(function (done) {
  console.log('Whois a bogus user should fail'.bold);

  request(app)
    .get('/whois/bogusStudent9')
    .expect('Content-Type', /json/)
    .expect(404)
    .end(function (err, res) {
      if(err)
        return done(err);

      done();
    });
});
