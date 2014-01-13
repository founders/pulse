/**
* Holds a single comment
*/
var Ribcage = require('ribcage-view')
  , CommentView
  , bind = require('lodash.bind')
  , marked = require('marked')
  , autolinks = require('autolinks')
  , moment = require('moment');

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
  var dateInMoment = moment(this.comment.get('updated'));
  comment.relativeDate = dateInMoment.fromNow();
  comment.fullDate = dateInMoment.format('ddd. MMM DDDo YYYY, h:mm:ss a');
  comment.text = marked(autolinks(comment.text, 'markdown'));
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
    this.$('.js-update-relative-date').text(moment(this.accomplishment.get('updated')).fromNow());
  }
});

module.exports = CommentView;
