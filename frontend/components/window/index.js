/* global App */

/**
* The main application window
*/
var Ribcage = require('ribcage-view')
  , User = require('../../models/user')
  , Accomplishment = require('../../models/accomplishment')
  , Comment = require('../../models/comment')
  , Accomplishments = require('../../collections/accomplishments')
  , AccomplishmentView = require('../accomplishment')
  , AppWindow
  , io = require('socket.io-browserify')
  , $ = require('jquery-browserify');

AppWindow = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-app-window'
, events: {
    'click .js-comment': 'sendComment'
  , 'click .js-accomplish': 'sendAccomplishment'
  , 'click .js-join': 'joinUs'
  , 'keyup .js-entry-input': 'handleFormKeyup'
  , 'submit form': 'noop'
  }
, authenticated: false
, user: null
, afterInit: function () {
    var self = this
      , socket = io.connect('/');

    this.accomplishments = new Accomplishments([]);
    this.accomplishments.on('add remove change', function () {
      self.render();
      self.scrollDown();
    }, this);
    this.accomplishments.on('error', App.handleError);

    // Once accomplishments are loaded for the first time
    // , load the last one's comments
    this.accomplishments.once('sync', function () {
      if(self.accomplishments.length) {
        self.accomplishments.last().loadComments();
      }
    });

    this.accomplishments.fetch();

    socket.on('accomplishment', function (data) {
      var accomplishment = new Accomplishment(Accomplishment.prototype.parse(data));

      self.accomplishments.add(accomplishment);
      accomplishment.loadComments();
    });

    socket.on('comment', function (data) {
      var lastAccomplishment = self.accomplishments.last();

      if(lastAccomplishment.commentsLoaded()) {
        lastAccomplishment.addComment(new Comment(Comment.prototype.parse(data)));
        self.scrollDown();
      }
    });

    $.ajax('/whoami', {
      dataType: 'json'
    , statusCode: {
        200: function (data) {
          self.authenticated = true;
          self.user = new User(data);
        }
      }
    , complete: function () {
        self.render();
      }
    });
  }
, scrollDown: function () {
    var mainPane = this.$('.js-main-pane');
    mainPane.scrollTop(mainPane[0].scrollHeight);
  }
, afterRender: function () {
    var self = this
      , mainPane = this.$('.js-main-pane');

    this.$('.invalid-hint').hide();
    this.$('.incomplete-hint').hide();

    this.accomplishments.each(function (accomplishment) {
      self.appendSubview(new AccomplishmentView({model: accomplishment}), mainPane);
    });

    this.$('.js-entry-input').focus();
  }
, sendComment: function () {
    var self = this
      , newComment = new Comment({
          text: this.$('.js-entry-input').val()
        });

    newComment.on('error', function () {
      self.$('.enter-hint').hide();
      self.$('.invalid-hint').show();
      self.$('.incomplete-hint').hide();

      self.$('.js-entry-input').addClass('invalid').focus();
    });

    newComment.save({}, {
      success: function () {
        self.$('.enter-hint').show();
        self.$('.invalid-hint').hide();
        self.$('.incomplete-hint').hide();
        self.$('.js-entry-input').removeClass('invalid').val('').focus();
      }
    });
  }
, sendAccomplishment: function () {
    var self = this
      , newAccomplishment = new Accomplishment({
          text: this.$('.js-entry-input').val()
        });

    newAccomplishment.on('error', function () {
      self.$('.enter-hint').hide();
      self.$('.invalid-hint').show();
      self.$('.incomplete-hint').hide();

      self.$('.js-entry-input').addClass('invalid').focus();
    });

    newAccomplishment.save({}, {
      success: function () {
        self.$('.enter-hint').show();
        self.$('.invalid-hint').hide();
        self.$('.incomplete-hint').hide();
        self.$('.js-entry-input').removeClass('invalid').val('').focus();
      }
    });
  }
, joinUs: function () {
    App.navigate('/authenticate', {trigger: true});
  }
, handleFormKeyup: function (e) {
    if (event.keyCode == 13) {
      if(event.shiftKey)
        this.sendAccomplishment(e);
      else
        this.sendComment(e);
    }
  }
, beforeClose: function () {
    this.accomplishments.off();
    delete this.accomplishments;
  }
, noop: function (e) {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
, context: function () {
    return {
      authenticated: this.authenticated
    , user: this.user ? this.user.toJSON() : {}
    };
  }
});

module.exports = AppWindow;
