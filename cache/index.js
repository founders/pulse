var redis = require('redis')
  , async = require('async')
  , config = require('../config')
  , client
  , ready = false
  , throttled = []
  , set
  , get;

client = redis.createClient(config.redis.port, config.redis.host);

if(process.env.NODE_ENV == 'production') {
  client.auth(config.redis.host + ':' + config.redis.auth, function (err) {
    console.log(arguments);

    if(err)
      throw err;
  });
}


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
