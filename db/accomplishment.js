var mongoose = require('mongoose')
  , schema = new mongoose.Schema({
      text: {
        type: String
      , trim: true
      , required: true
      , match: /^[^\0]{10,500}$/
      }
    , user_id: {
        type: String
      , required: true
      }
    , updated: { type: Date, default: Date.now }
    })
  , Accomplishment;

// Remove consecutive newlines
schema.pre('save', function (next) {
  this.text = this.text.replace(/[\n]+/, '\n');
  next();
});

Accomplishment = mongoose.model('Accomplishment', schema);

module.exports = Accomplishment;
