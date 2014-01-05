var mongoose = require('mongoose')
  , config = require('../config');

mongoose.connect(config.db.connectionString);

module.exports = {
  models: {
    User: require('./user')
  , Accomplishment: require('./accomplishment')
  , Comment: require('./comment')
  }
};
