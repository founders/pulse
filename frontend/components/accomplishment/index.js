/**
* Holds a single accomplishment
*/
var Ribcage = require('ribcage-view')
  , AccomplishmentView
  , relDat = require('relative-date')
  , CommentView = require('../comment')
  , bind = require('lodash.bind')
  , marked = require('marked')
  , autolinks = require('autolinks');

marked.setOptions({
  sanitize: true
});

AccomplishmentView = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-accomplishment'
, loadingComments: false
, intervalHandle: null
, events: {
    'click .js-load-comments'   :   'loadComments',
    'mouseover .header-right'   :   'loadRealTimeHeader',
    'mouseleave .header-right'  :   'loadRelativeTimeHeader'
  }

, afterInit: function (opts) {
    var self = this;

    if(!opts || !opts.model)
      throw new Error('This view must be initialized with an Accomplishment model');

    this.accomplishment = opts.model;
    this.updateDates = bind(this.updateDates, this);

    this.accomplishment.on('comments:initialLoad', function () {
      this.loadingComments = true;
      self.render();
    });

    this.accomplishment.on('comments:sync', function () {
      self.loadingComments = false;
      self.render();
    });

    this.accomplishment.on('comments:add', function () {
      self.render();
    });
  }
, beforeRender: function() {
  if (this.intervalHandle)
    clearInterval(this.intervalHandle);
  }
, context: function () {
    var accomplishment = this.accomplishment.toJSON();
    accomplishment.relativeDate = relDat(this.accomplishment.get('updated'));
    accomplishment.text = marked(autolinks(accomplishment.text, 'markdown'));

    return {
      accomplishment: accomplishment
    , noCommentsLoaded: this.accomplishment.comments === null && !this.loadingComments
    , noComments: this.accomplishment.commentsLoaded() && this.accomplishment.getComments().length === 0
    , loadingComments: this.loadingComments
    };
  }
, afterRender: function() {
    var self = this
    , target = this.$('.js-comment-container');

    setInterval(this.updateDates, 60000);

    if(this.accomplishment.commentsLoaded())
      this.accomplishment.getComments().each(function (comment) {
        var commentView = new CommentView({model : comment});
        self.appendSubview(commentView, target);
      });
  }
, beforeClose: function() {
  if (this.intervalHandle)
    clearInterval(this.intervalHandle);
  if(this.comments)
      this.comments.off();
  }
, insertComment: function (commentModel) {
    if(this.accomplishment.commentsLoaded())
      this.accomplishment.addComment(commentModel);
  }
, loadComments: function () {
    this.accomplishment.loadComments();
  }
, loadRealTimeHeader: function() {
    this.$('.header-relative-date').hide();
    this.$('.header-real-hidden-date').show();
  }
, loadRelativeTimeHeader: function() {
    this.$('.header-relative-date').show();
    this.$('.header-real-hidden-date').hide();
  }
, updateDates: function() {
    this.$('.js-update-header-relative-date').text(relDat(this.accomplishment.get('updated')));
  }
});

module.exports = AccomplishmentView;
