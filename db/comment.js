var mongoose = require('mongoose')
  , schema = new mongoose.Schema({
      text: 'string'
    , accomplishment_id: 'string'
    , user_id: 'string'
    })
  , Comment = mongoose.model('Comment', schema);

module.exports = Comment;
