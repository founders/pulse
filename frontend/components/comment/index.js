/**
* Holds a single comment
*/
var Ribcage = require('ribcage-view')
  , CommentView
  , relDat = require('relative-date')
  , bind = require('lodash.bind');

CommentView = Ribcage.extend({
  template: require('./template.hbs')
, tagName: 'li'
, className: 'comment-body topcoat-list__item'
, loadingComments: false
, intervalHandle: null
, events: {
    'mouseover .signature-left' :   'loadRealTimeComment',
    'mouseleave .signature-left':   'loadRelativeTimeComment'
  }

, afterInit: function (opts) {

    if(!opts || !opts.model)
      throw new Error('This view must be initialized with an Comment model');

    this.comment = opts.model;
    this.updateDates = bind(this.updateDates, this);
  }
, beforeRender: function() {
  if (this.intervalHandle)
    clearInterval(this.intervalHandle);
  }
, context: function () {
  var comment = this.comment.toJSON();
  comment.relativeDate = relDat(this.comment.get('updated'));
  return comment;
  }
, afterRender: function() {
  setInterval(this.updateDates, 60000);
  }
, beforeClose: function() {
  if (this.intervalHandle)
    clearInterval(this.intervalHandle);
  }
, loadRealTimeComment: function() {
    this.$('.comment-relative-date').hide();
    this.$('.comment-real-hidden-date').show();
  }
, loadRelativeTimeComment: function() {
    this.$('.comment-relative-date').show();
    this.$('.comment-real-hidden-date').hide();
  }
, updateDates: function() {
    this.$('.js-update-relative-date').text(relDat(this.comment.get('updated')));
  }
});

module.exports = CommentView;