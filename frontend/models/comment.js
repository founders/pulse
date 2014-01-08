var Backbone = require('backbone')
  , Comment;

Comment = Backbone.Model.extend({
  url: '/comments'
, parse: function (resp) {
    if(resp && resp.updated && typeof resp.updated == 'string')
      resp.updated = new Date(resp.updated);

    return resp;
  }
});

module.exports = Comment;
