var mongoose = require('mongoose')
  , schema = new mongoose.Schema({
      text: 'string'
    , user_id: 'string'
    })
  , Accomplishment = mongoose.model('Accomplishment', schema);

module.exports = Accomplishment;
