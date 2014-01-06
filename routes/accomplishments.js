var Accomplishment = require('../db').models.Accomplishment
  , User = require('../db').models.User
  , JSONStream = require('JSONStream')
  , through = require('through')
  , cache = require('../cache')
  , noCache = false;

exports.list = function(req, res, next){
  var toFetch = 0
    , localCache = {}
    , stream = Accomplishment
      .find({})
      .select('text user_id')
      .stream()
    , processPiece
    , i = 0
    , queue = []
    , finished = false
    , endProcessing
    , log = []
    , addLog;

  addLog = function (message) {
    log.push(message);
  };

  processPiece = function (data) {
    var self = this;

    (function (pieceIndex) {
      // If the user data was found in the cache, immediately queue
      if(localCache[data.user_id]) {
        if(process.env.NODE_ENV == 'testing')
          addLog('Fetching from local cache');

        queue[pieceIndex] = {
          id: data._id
        , text: data.text
        , user: localCache[data.user_id]
        };

        endProcessing.apply(self);
      }
      // Otherwise, look it up in the redis cache
      else {
        ++toFetch;

        if(process.env.NODE_ENV == 'testing')
          addLog('Fetching from redis');

        cache.get('user-' + data.user_id, function (err, cacheData) {
          if(err)
            return next(err);

          // If in redis, save that data to the local cache
          if(cacheData && !noCache) {
            if(process.env.NODE_ENV == 'testing')
              addLog('Found in redis');

            localCache[data.user_id] = cacheData;
            --toFetch;
            queue[pieceIndex] = {
              id: data._id
            , text: data.text
            , user: localCache[data.user_id]
            };
            endProcessing.apply(self);
          }

          // Otherwise, hit up mongo
          else {
            if(process.env.NODE_ENV == 'testing')
              addLog('Not found in redis, reading from mongo');

            User.findOne({_id: data.user_id}, function (err, userData) {
              var dat;

              if(err)
                return next(err);

              // On success, save it to redis
              if(process.env.NODE_ENV == 'testing')
                addLog('Saving to redis & local cache');

              dat = {
                id: userData._id
              , firstname: userData.firstname
              , lastname: userData.lastname
              };

              localCache[data.user_id] = dat;

              cache.set('user-' + data.user_id, dat, function (err) {

                if(err)
                  return next(err);

                --toFetch;
                queue[pieceIndex] = {
                  id: data._id
                , text: data.text
                , user: localCache[data.user_id]
                };
                endProcessing.apply(self);
              });
            });
          }
        });
      }
    }(i));

    ++i;
  };

  endProcessing = function () {
    if(toFetch === 0 && finished) {
      for(var i=0, ii=queue.length; i<ii; ++i)
        this.queue(queue[i]);

      if(process.env.NODE_ENV == 'testing')
        this.queue(log);

      this.queue(null);
    }
  };

  res.setHeader('Content-Type', 'application/json');

  stream
    .pipe(through(processPiece, function () {
      finished = true;
      endProcessing.apply(this);
    }))
    .pipe(JSONStream.stringify())
    .pipe(res);
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
