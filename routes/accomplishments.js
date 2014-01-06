var Accomplishment = require('../db').models.Accomplishment
  , User = require('../db').models.User
  , _ = require('lodash');

exports.list = function(req, res, next){
  Accomplishment
    .find({})
    .select('text user_id')
    .limit(50)
    .sort('-updated')
    .exec(function (err, accomplishments) {
      if(err)
        return next(err);

      if(accomplishments.length === 0)
        return res.send([]);

      // Construct the $or condition
      var orCond = _(accomplishments)
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

        res.send(_.map(accomplishments, function (a) {
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

      Accomplishment.create({
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
          res.io.broadcast('accomplishment', dat);
        }
      });
    });
};

exports.remove = function(req, res){
  res.send('respond with a resource');
};
