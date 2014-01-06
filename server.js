var http = require('http')
  , app = require('./app')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , socketioMiddleware = require('./middleware/socketio')
  , _ = require('lodash')
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

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
