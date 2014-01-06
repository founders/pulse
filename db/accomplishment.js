var mongoose = require('mongoose')
  , schema = new mongoose.Schema({
      text: {
        type: String
      , trim: true
      , match: /^.{10,500}$/
      }
    , user_id: 'string'
    , updated: { type: Date, default: Date.now }
    })
  , Accomplishment = mongoose.model('Accomplishment', schema);

module.exports = Accomplishment;
