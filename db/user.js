var mongoose = require('mongoose')
  , schema = new mongoose.Schema({
      firstname: 'string'
    , lastname: 'string'
    , email: 'string'
    , hash: 'string'
    , salt: 'string'
    , validationCode: 'string'
    })
  , User = mongoose.model('User', schema);

module.exports = User;
