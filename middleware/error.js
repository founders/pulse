/*jshint unused: false*/
// next is unused, but express needs four args to know this is an error middleware

var handleError;

handleError = function (err, req, res, next) {
  if(err)
    res.send(500, {error: err});
  else
    next();
};

module.exports = handleError;
