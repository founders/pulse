var mongoose = require('mongoose')
  , schema = new mongoose.Schema({
      text: {
        type: String
      , trim: true
      , required: true
      , match: /^.{10,500}$/
      }
    , user_id: {
        type: String
      , required: true
      }
    , updated: { type: Date, default: Date.now }
    })
  , Accomplishment = mongoose.model('Accomplishment', schema);

module.exports = Accomplishment;
