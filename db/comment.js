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
  , Comment;

// Remove consecutive newlines
schema.pre('save', function (next) {
  this.text = this.text.replace(/[\n]+/, '\n');
  next();
});

Comment = mongoose.model('Comment', schema);

module.exports = Comment;
