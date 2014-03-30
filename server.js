if(process.env.NODE_ENV == 'production') {
  require('newrelic');
}

var http = require('http')
  , path = require('path')
  , fs = require('fs')
  , async = require('async')
  , uglify = require('uglify-js')
  , cleancss = require('clean-css')
  , app = require('./app')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server, {log: false})
  , socketioMiddleware = require('./middleware/socketio')
  , _ = require('lodash')
  , atomifyjs = require('atomify-js')
  , atomifycss = require('atomify-css')
  , pool = []
  , broadcast;

// Broadcasts something to all connected clients
broadcast = function (evt, data) {
  _.each(pool, function (socket) {
    socket.emit(evt, data);
  });
};

socketioMiddleware.references = {
  ref: io
, broadcast: broadcast
};

io.sockets.on('connection', function (socket) {
  pool.push(socket);

  socket.on('disconnect', function () {
    _.remove(pool, socket);
  });
});

// Compile front-end
async.series([
  function (next) {
    atomifyjs({
      entry: path.join(__dirname, 'frontend', 'index.js')
    }, function (err, src) {
      if(err)
        return next(err);

      if(process.env.NODE_ENV == 'production')
        src = uglify.minify(src, {fromString: true}).code;

      fs.writeFile(path.join(__dirname, 'public', 'pulse.js'), src, function (err) {
        if(err)
          return next(err);

        next();
      });
    });
  }
, function (next) {
    atomifycss({
      entry: path.join(__dirname, 'frontend', 'index.css')
    }, function (err, src) {
      if(err)
        return next(err);

      if(process.env.NODE_ENV == 'production')
        src = cleancss({
          keepSpecialComments: false
        }).minify(src);

      fs.writeFile(path.join(__dirname, 'public', 'pulse.css'), src, function (err) {
        if(err)
          return next(err);

        next();
      });
    });
  }
], function (err) {
  if(err) {
    throw err;
  }
  else {
    server.listen(app.get('port'));
  }
});
