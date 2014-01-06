var User = require('../db').models.User
  , async = require('async')
  , JSONStream = require('JSONStream')
  , through = require('through')
  , bcrypt = require('bcrypt')
  , ildir = require('illinois-directory');

exports.list = function (req, res) {
  var stream = User
    .find({})
    .select('firstname lastname email')
    .stream();

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
  var hash
    , salt;

  async.series([
    function (then) {
      User.findOne({email: req.body.email}, function (err, data) {
        if(err)
          return then(err);

        if(data)
          return res.send(500, {error: 'The email already exists in the system'});

        then();
      });
    }
  , function (then) {
      bcrypt.genSalt(8, function (err, s) {
        if(err)
          return then(err);

        bcrypt.hash(req.body.password, s, function (err, h) {
          if(err)
            return then(err);

          salt = s;
          hash = h;

          then();
        });
      });
    }
  , function (then) {
      User.create({
        firstname: req.body.firstname
      , lastname: req.body.lastname
      , email: req.body.email
      , hash: hash
      , salt: salt
      }, function (err, data) {
        if(err)
          return then(err);

        req.session.user_id = data._id;

        res.send({
          id: data._id
        , firstname: data.firstname
        , lastname: data.lastname
        , email: data.email
        });

        if(res.io) {
          res.io.broadcast('register', {
            firstname: data.firstname
          , lastname: data.lastname
          });
        }

        then();
      });
    }
  ], function (err) {
    if(err)
      return next(err);
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

exports.whoami = function (req, res, next) {
  if(!req.session.user_id) {
    return res.send(403, {
        error: 'Not authenticated'
      });
  }

  User.findOne({_id: req.session.user_id}, function (err, data) {
    if(err)
      return next(err);

    if(!data)
      return res.send(404, new Error('No such user'));

    res.send({
      id: data._id
    , firstname: data.firstname
    , lastname: data.lastname
    , email: data.email
    });
  });
};

exports.whois = function (req, res, next) {
  if(!req.params.netid)
    return next(new Error('You must provide a NetID to look up'));

  User.findOne({email: req.params.netid + '@illinois.edu'}, function (err, data) {
    if(err)
      return next(err);

    if(!data) {
      ildir(req.params.netid, function (err, details) {
        if(err)
          return res.send(404, {error: 'The netID could not be found'});

        res.send(details);
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
