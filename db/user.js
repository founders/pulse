var mongoose = require('mongoose')
  , schema = new mongoose.Schema({
      firstname: {
        type: String
      , trim: true
      , required: true
      , match: /^[a-zA-Z]{2,}$/
      }
    , lastname: {
        type: String
      , trim: true
      , required: true
      , match: /^[a-zA-Z]{2,}$/
      }
    , email: {
        type: String
      , trim: true
      , required: true
      , match: /^[a-zA-Z0-9]{2,}@illinois.edu$/
      , lowercase: true
      }
    , hash: {
        type: String
      , required: true
      }
    , salt: {
        type: String
      , required: true
      }
    , validationCode: {
        type: String
      , trim: true
      , required: true
      , match: /^[0-9]{6,}$/
      }
    , updated: { type: Date, default: Date.now }
    })
  , User = mongoose.model('User', schema);

module.exports = User;
