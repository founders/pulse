/**
* Holds a single accomplishment
*/
var Ribcage = require('ribcage-view')
  , AccomplishmentView;

AccomplishmentView = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-accomplishment'
, loadingComments: false
, events: {
    'click .js-load-comments': 'loadComments'
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
    return {
      accomplishment: this.accomplishment.toJSON()
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
});

module.exports = AccomplishmentView;
