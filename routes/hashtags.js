var Hashtag = require('../db').models.Hashtag
  , map = require('lodash').map;

exports.list = function(req, res, next){
  Hashtag
    .find({})
    .limit(50)
    .sort('-updated')
    .exec(function (err, hashtags) {
      if(err)
        return next(err);

      hashtags = map(hashtags, function (hashtag) {
        return {
          id: hashtag._id
        , name: hashtag.name
        };
      });

      return res.send(hashtags);

    });
};
