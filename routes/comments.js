var Comment = require('../db').models.Comment
  , Accomplishment = require('../db').models.Accomplishment
  , User = require('../db').models.User
  , async = require('async')
  , loadUsers = require('../helpers/loadUsers')
  , _ = require('lodash');

exports.list = function(req, res, next) {
  var gt
    , lte;

  if(!req.query.after)
    return next('Cannot get comments without a range (e.g. /comments?after=<accomplishment_id>)');

  async.series([
    function (done) {
      Accomplishment
        .findOne({_id: req.query.after}, function (err, accomplishment) {
          if(err)
            return done(err);

          if(!accomplishment)
            return done('Invalid accomplishment id');

          gt = accomplishment.updated;

          done();
        });
    }
  , function (done) {
      // Now get the next accomplishment
      Accomplishment
        .findOne({updated: {$gt: gt}}) // Find the next accomplishment
        .sort({updated: 1}) // Sort ascending, i.e. get the first possible accomplishment
        .exec(function (err, nextAccomplishment) {
          if(err)
            return done(err);

          if(!nextAccomplishment)
            lte = new Date();
          else
            lte = nextAccomplishment.updated;

          done();
        });
    }
  , function (done) {
      Comment
      .find({updated: {$gt: gt, $lte: lte}})
      .sort({updated: -1})
      .exec(function (err, comments) {
        if(err)
          return done(err);

        if(comments.length === 0)
          return res.send([]);

        loadUsers(comments, function (err, results) {
          if(err)
            return next(err);

          res.send(results);
        });
      });
    }
  ], function (err) {
    if(err)
      return next(err);
  });

  Comment
    .find({})
    .select('text user_id updated')
    .sort('-updated')
    .exec(function (err, comments) {
      if(err)
        return next(err);

      if(comments.length === 0)
        return res.send([]);

      // Construct the $or condition
      var orCond = _(comments)
        .pluck('user_id')
        .uniq()
        .map(function (u) {return {_id: u};})
        .value();

      User
        .find({$or: orCond})
        .select('firstname lastname')
        .exec(function (err, users) {
        if(err)
          return next(err);

        var userMap = {};

        _.each(users, function (u) {
          userMap[u._id] = {
            id: u._id
          , firstname: u.firstname
          , lastname: u.lastname
          };
        });

        res.send(_.map(comments, function (a) {
          return {
            id: a._id
          , text: a.text
          , updated: a.updated
          , user: userMap[a.user_id]
          };
        }));
      });
    });
};

exports.create = function(req, res, next){
  if(!req.session.user_id) {
    return res.send(403, {
        error: 'Not authenticated'
      });
  }
  User
    .findOne({_id: req.session.user_id}, function (err, user) {
      if(err)
        return next(err);

      if(!user)
        return res.send(403, {
            error: 'Not authenticated'
          });

      Comment.create({
        text: req.body.text
      , user_id: req.session.user_id
      }, function (err, data) {
        var dat;

        if(err)
          return next(err);

        dat = {
          id: data._id
        , text: data.text
        , user_id: data.user_id
        , updated: data.updated
        };

        res.send(dat);

        if(res.io) {
          dat.user = {
            id: user._id
          , firstname: user.firstname
          , lastname: user.lastname
          };
          delete dat.user_id;
          res.io.broadcast('comment', dat);
        }
      });
    });
};
