var Accomplishment = require('../db').models.Accomplishment
  , User = require('../db').models.User
  , _ = require('lodash');

exports.list = function(req, res, next){
  Accomplishment
    .find({})
    .select('text user_id')
    .exec(function (err, accomplishments) {
      if(err)
        return next(err);

      if(accomplishments.length === 0)
        return res.send([]);

      var uniqueUsers = _.uniq(_.map(accomplishments, function (a) {return a.user_id;}))
        , orCond = _.map(uniqueUsers, function (u) {return {_id: u};});

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

  Accomplishment.create({
    text: req.body.text
  , user_id: req.session.user_id
  }, function (err, data) {
    if(err)
      return next(err);

    res.send({
      id: data._id
    , text: data.text
    , user_id: data.user_id
    });
  });
};

exports.remove = function(req, res){
  res.send('respond with a resource');
};
