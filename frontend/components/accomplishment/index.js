/**
* Holds a single accomplishment
*/
var Ribcage = require('ribcage-view')
  , AccomplishmentView
  , relDat = require('relative-date')
  , CommentView = require('../comment');

AccomplishmentView = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-accomplishment'
, loadingComments: false
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
    , noCommentsLoaded: this.accomplishment.comments === null && !this.loadingComments
    , noComments: this.accomplishment.commentsLoaded() && this.accomplishment.getComments().length === 0
    , loadingComments: this.loadingComments
    };
  }
, afterRender: function() {
    var self = this
    , target = this.$('.js-comment-container');

    if(this.accomplishment.commentsLoaded())
      this.accomplishment.getComments().each(function (comment) {
        var commentView = new CommentView({model : comment});
        self.appendSubview(commentView, target);
      });
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
});

module.exports = AccomplishmentView;
