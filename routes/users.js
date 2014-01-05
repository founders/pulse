var User = require('../db').models.User
  , JSONStream = require('JSONStream')
  , through = require('through')
  , bcrypt = require('bcrypt');

exports.list = function (req, res, next) {
  var stream = User
    .find({})
    .select('firstname lastname email')
    .stream();

  stream.on('error', function (err) {
    next(err);
  });

  res.setHeader('Content-Type', 'application/json');
  stream
    .pipe(through(function (data) {
      if(data._id == req.session.user_id) {
        this.queue({
          id: data._id
        , firstname: data.firstname
        , lastname: data.lastname
        , email: data.email
        });
      }
      else {
        this.queue({
          id: data._id
        , firstname: data.firstname
        , lastname: data.lastname
        });
      }
    }))
    .pipe(JSONStream.stringify())
    .pipe(res);
};

exports.create = function (req, res, next) {
  bcrypt.genSalt(8, function (err, salt) {
    if(err)
      return next(err);

    bcrypt.hash(req.body.password, salt, function (err, hash) {
      if(err)
        return next(err);

      User.create({
        firstname: req.body.firstname
      , lastname: req.body.lastname
      , email: req.body.email
      , hash: hash
      , salt: salt
      }, function (err, data) {
        if(err)
          return next(err);

        req.session.user_id = data._id;

        res.send({
          id: data._id
        , firstname: data.firstname
        , lastname: data.lastname
        , email: data.email
        });
      });
    });
  });
};

exports.view = function (req, res, next) {
  if(!req.session.user_id) {
    return res.send(403, {
        error: 'Not authenticated'
      });
  }

  User.findOne({_id: req.params.id}, function (err, data) {
    if(err)
      return next(err);

    if(!data) {
      return res.send(404, {
          error: 'User not found'
        });
    }

    if(data._id == req.session.user_id) {
      res.send({
        id: data._id
      , firstname: data.firstname
      , lastname: data.lastname
      , email: data.email
      });
    }
    else {
      res.send({
        id: data._id
      , firstname: data.firstname
      , lastname: data.lastname
      });
    }
  });
};

exports.auth = function (req, res, next) {
  User.findOne({email: req.body.email}, function (err, data) {
    if(err)
      return next(err);

    if(!data) {
      return res.send(403, {
          error: 'Email address is not registered'
        });
    }

    bcrypt.compare(req.body.password, data.hash, function (err, authed) {
      if(err)
        return next(err);

      if(!authed) {
        res.send(403, {
          error: 'Incorrect password'
        });
      }
      else {
        req.session.user_id = data._id;

        res.send({
          id: data._id
        , firstname: data.firstname
        , lastname: data.lastname
        , email: data.email
        });
      }
    });
  });
};

exports.unauth = function (req, res) {
  req.session = null;
  res.send({});
};
