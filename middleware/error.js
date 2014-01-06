var handleError;

handleError = function (err, req, res, next) {
  res.send(500, {error: err});
  next();
};

module.exports = handleError;
