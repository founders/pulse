var mongoose = require('mongoose')
  , schema = new mongoose.Schema({
      firstname: {
        type: String
      , trim: true
      , match: /^[a-zA-Z]{2,}$/
      }
    , lastname: {
        type: String
      , trim: true
      , match: /^[a-zA-Z]{2,}$/
      }
    , email: {
        type: String
      , trim: true
      , match: /^[a-zA-Z0-9]{2,}@illinois.edu$/
      }
    , hash: 'string'
    , salt: 'string'
    , validationCode: {
        type: String
      , trim: true
      , match: /^[a-zA-Z]{6,}$/
      }
    , updated: { type: Date, default: Date.now }
    })
  , User = mongoose.model('User', schema);

module.exports = User;
