/**
* Holds a single accomplishment
*/
var Ribcage = require('ribcage-view')
  , AccomplishmentView
  , relDat = require('relative-date');

AccomplishmentView = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-accomplishment'
, loadingComments: false
, events: {
    'click .js-load-comments'   :   'loadComments',
    'mouseover .header-right'   :   'loadRealTimeHeader',
    'mouseover .signature-left' :   'loadRealTimeComment',
    'mouseleave .header-right'  :   'loadRelativeTimeHeader',
    'mouseleave .signature-left':   'loadRelativeTimeComment'
  }

, afterInit: function (opts) {
    var self = this;

    if(!opts || !opts.model)
      throw new Error('This view must be initialized with an Accomplishment model');

    this.accomplishment = opts.model;

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
, context: function () {
    var accomplish = this.accomplishment.toJSON();
    accomplish.relativeDate = relDat(this.accomplishment.get('updated'));
    return {
      accomplishment: accomplish
    , comments: this.accomplishment.commentsLoaded() ? this.accomplishment.getComments() : []
    , noCommentsLoaded: this.accomplishment.comments === null && !this.loadingComments
    , noComments: this.accomplishment.commentsLoaded() && this.accomplishment.getComments().length === 0
    , loadingComments: this.loadingComments
    };
  }
, insertComment: function (commentModel) {
    if(this.accomplishment.commentsLoaded())
      this.accomplishment.addComment(commentModel);
  }
, loadComments: function () {
    this.accomplishment.loadComments();
  }
, beforeClose: function () {
    if(this.comments)
      this.comments.off();
  }
, loadRealTimeHeader: function() {
    this.$('.header-relative-date').hide();
    this.$('.header-real-hidden-date').show();
  }
, loadRelativeTimeHeader: function() {
    this.$('.header-relative-date').show();
    this.$('.header-real-hidden-date').hide();
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

module.exports = AccomplishmentView;
