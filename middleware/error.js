/*jshint unused: false*/
// next is unused, but express needs four args to know this is an error middleware

var handleError;

handleError = function (err, req, res, next) {
  res.send(500, {error: err});
};

module.exports = handleError;
