var db = require('../db')
 , async = require('async')
 , makeRemoveTask;

makeRemoveTask = function (Model, modelName) {
  return function (next) {
      Model.remove({}, function (err) {
        if(err)
          return next(err);

        next(null, 'Removed ' + modelName);
      });
    };
};

module.exports = function (req, res, next) {
  var dropChain = [];

  for(var modelName in db.models) {
    var Model = db.models[modelName];

    dropChain.push(makeRemoveTask(Model, modelName));
  }

  async.series(dropChain, function (err, log) {
    if(err)
      next(err);

    res.send({log: log});
  });
};
