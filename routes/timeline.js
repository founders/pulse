var _ = require('lodash')
  , Accomplishment = require('../db').models.Accomplishment
  , Comment = require('../db').models.Comment
  , async = require('async')
  , loadUsers = require('../helpers/loadUsers');

exports.list = function(req, res, next) {
  var accomplishments
    , comments;

  async.series([
    // First load accomplishments
    function (done) {
      Accomplishment
        .find({})
        .select('text user_id updated')
        .sort('-updated')
        .limit(20)
        .exec(function (err, data) {
          if(err)
            return done(err);

          accomplishments = data;
          done();
        });
    }
    // Now get the comments after the earliest one
  , function (done) {
      // Possble on initial deploy of app
      if(accomplishments.length === 0) {
        comments = [];
        return done();
      }

      Comment
      .find({updated: {$gte: accomplishments[accomplishments.length - 1].updated}})
      .exec(function (err, data) {
          if(err)
            return done(err);

          comments = data;
          done();
      });
    }
  ], function (err) {
    if(err)
      return next(err);

    if(accomplishments.length === 0)
      return res.send([]);

    var markAsComment = function (c) {
          c.c = true;
          return c;
        }
      , sortTimeline = function (a, b) {
          // If timestamps match, then put accomplishments before comments
          if(a.updated == b.updated) {
            if(!a.c && b.c)
              return -1;
            if(a.c && !b.c)
              return 1;
            return 0;
          }

          return a.updated - b.updated;
        }
      , joined;

    if(comments.length) {
      // Merge together the comments and accomplishments

      // Identify these as comments
      comments = _.map(comments, markAsComment);

      // Merge with the accomplishments
      joined = accomplishments.concat(comments);

      // Sort
      joined = _.sortBy(joined, sortTimeline);
    }
    else {
      joined = accomplishments;
    }

    loadUsers(joined, function (err, results) {
      if(err)
        return next(err);

      res.send(results);
    });
  });
};
