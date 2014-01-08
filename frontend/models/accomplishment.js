var Backbone = require('backbone')
  , Comments = require('../collections/comments')
  , Accomplishment;

Accomplishment = Backbone.Model.extend({
  url: '/accomplishments'
, initialize: function () {
    this.comments = null;
  }
, commentsLoaded: function () {
    return this.comments !== null;
  }
, parse: function (resp) {
    if(resp && resp.updated && typeof resp.updated == 'string')
      resp.updated = new Date(resp.updated);

    return resp;
  }
, addComment: function (comment) {
    if(!this.comments)
      throw new Error('You need to loadComments before you can add a comment');

    this.comments.add(comment);
  }
, getComments: function () {
    if(!this.comments)
      throw new Error('You need to loadComments before you can get comments');

    return this.comments.toJSON();
  }
, loadComments: function () {
    var self = this;

    if(!this.comments) {
      this.trigger('comments:initialLoad');

      this.comments = new Comments([], {
        accomplishment_id: this.get('id')
      });

      this.listenTo(this.comments, 'sync', function () {
        self.trigger('comments:sync');
      });

      this.listenTo(this.comments, 'add', function () {
        self.trigger('comments:add');
      });
    }

    this.comments.fetch();
  }
});

module.exports = Accomplishment;
