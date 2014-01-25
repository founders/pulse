var mongoose = require('mongoose')
  , schema = new mongoose.Schema({
      name: {
        type: String
      , trim: true
      , required: true
      , match: /^\S+$/
      }
    , comment_id: {
        type: String
      , required: false
      }
    , accomplishment_id: {
        type: String,
        required: false
      }
    })
  , Hashtag = mongoose.model('Hashtag', schema);

module.exports = Hashtag;
