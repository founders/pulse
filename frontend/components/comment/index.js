/**
* Holds a single comment
*/
var Ribcage = require('ribcage-view')
  , CommentView
  , relDat = require('relative-date');

CommentView = Ribcage.extend({
  template: require('./template.hbs')
, tagName: 'li'
, className: 'comment-body topcoat-list__item'
, loadingComments: false
, events: {
    'mouseover .signature-left' :   'loadRealTimeComment',
    'mouseleave .signature-left':   'loadRelativeTimeComment'
  }

, afterInit: function (opts) {

    if(!opts || !opts.model)
      throw new Error('This view must be initialized with an Comment model');

    this.comment = opts.model;
}
, context: function () {
  var comment = this.comment.toJSON();
  comment.relativeDate = relDat(this.comment.get('updated'));
  return comment;
}

, loadRealTimeComment: function() {
    this.$('.comment-relative-date').hide();
    this.$('.comment-real-hidden-date').show();
  }
, loadRelativeTimeComment: function() {
    this.$('.comment-relative-date').show();
    this.$('.comment-real-hidden-date').hide();
  }
});

module.exports = CommentView;