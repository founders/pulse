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
, className: 'pulse-comment'
, loadingComments: false
, intervalHandle: null
, events: {
    'mouseover .signature-left' :   'loadRealTimeComment'
    , 'mouseleave .signature-left':   'loadRelativeTimeComment'
    , 'mouseover .signature-right'  :   'loadNetId'
    , 'mouseleave .signature-right' :   'loadFullName'
  }

, afterInit: function (opts) {
    if(!opts || !opts.model)
      throw new Error('This view must be initialized with an Comment model');

    this.comment = opts.model;
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

  if (dateInMoment.year() != moment().year())
    comment.shortDate = dateInMoment.format('MM/DD/YY h:mm a');
  else
    comment.shortDate = dateInMoment.format('MM/DD h:mm a');

  comment.text = marked(autolinks(comment.text, 'markdown'));
  comment.netId = this.comment.get('user').email.split('@')[0];
  
  return comment;
  }
, afterRender: function() {
    this.intervalHandle = setInterval(bind(this.updateDates, this), 60000);
  }
, beforeClose: function() {
    if (this.intervalHandle)
      clearInterval(this.intervalHandle);
  }
, loadRealTimeComment: function() {
    this.$('.signature-relative-date').hide();
    this.$('.signature-real-hidden-date').show();
  }
, loadRelativeTimeComment: function() {
    this.$('.signature-relative-date').show();
    this.$('.signature-real-hidden-date').hide();
  }
, loadNetId: function() {
    this.$('.signature-user-name').hide();
    this.$('.signature-netid-hidden').show();
  }
, loadFullName: function() {
    this.$('.signature-user-name').show();
    this.$('.signature-netid-hidden').hide();
  }
, updateDates: function() {
    this.$('.js-update-relative-date').text(moment(this.comment.get('updated')).fromNow());
  }
});

module.exports = CommentView;
