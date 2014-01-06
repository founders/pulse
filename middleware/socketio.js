/**
* This wonkiness is so that request will have an .io property
* that allows broadcasting stuff to all connected clients
*
* e.g.
* req.io.broadcast('connected', {username: 'jimmy'});
*/

var socketioMiddleware
  , exported;

socketioMiddleware = function (req, res, next) {
  if(!exported.reference && process.env.NODE_ENV != 'testing')
    return next('You need to set the socket.io reference');

  req.io = exported.references;
  next();
};

exported = {
  middleware: socketioMiddleware
, references: null
};

module.exports = exported;
