var redis = process.env.NODE_ENV == 'production' ? require('iris-redis') : require('redis')
  , async = require('async')
  , config = require('../config')
  , client = redis.createClient(config.redis.port, config.redis.host)
  , ready = false
  , throttled = []
  , set
  , get;

set = function (key, value, cb) {
  if(ready) {
    client.set(key, JSON.stringify(value), cb);
  }
  // Wait until set up to run this
  else {
    throttled.push(function () {
      set(key, value, cb);
    });
  }
};

get = function (key, cb) {
  if(ready) {
    client.get(key, function (err, data) {
      if(err)
        return cb(err);

      cb(null, JSON.parse(data));
    });
  }
  else {
    throttled.push(function () {
      get(key, cb);
    });
  }
};

if(config.redis.auth)
  client.auth(config.redis.auth);

client.on('ready', function() {
  var temp;

  // Possible for more tasks to be added while
  // processing the throttled queue
  while(throttled.length) {
    temp = throttled;
    throttled = [];
    async.series(temp);
  }

  ready = true;
});

module.exports = {
  set: set
, get: get
};
