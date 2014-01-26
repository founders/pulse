/* global App */

/**
* The main application window
*/
var Ribcage = require('ribcage-view')
  , User = require('../../models/user')
  , Accomplishment = require('../../models/accomplishment')
  , Comment = require('../../models/comment')
  , Timeline = require('../../collections/timeline')
  , AccomplishmentView = require('../accomplishment')
  , CommentView = require('../comment')
  , AppWindow
  , io = require('socket.io-client')
  , $ = require('jquery-browserify')
  , socket;

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
    var self = this;

    if(!socket)
      socket = io.connect('/');

    this.timeline = new Timeline([]);
    this.timeline.on('add remove change', function () {
      self.render();
      self.scrollDown();
    }, this);
    this.timeline.on('error', App.handleError);

    this.timeline.fetch();

    socket.on('accomplishment', function (data) {
      var accomplishment = new Accomplishment(Accomplishment.prototype.parse(data));
      self.timeline.add(accomplishment);
    });

    socket.on('comment', function (data) {
      var comment = new Comment(Comment.prototype.parse(data));
      self.timeline.add(comment);
    });

    socket.on('disconnect', function() {
      socket.socket.reconnect();
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
    var accomplishmentPane = this.$('.js-accomplishment-pane')
      , commentPane = this.$('.js-comment-pane');

    accomplishmentPane.scrollTop(accomplishmentPane[0].scrollHeight);
    commentPane.scrollTop(commentPane[0].scrollHeight);
  }
, afterRender: function () {
    var self = this
      , accomplishmentPane = this.$('.js-accomplishment-pane')
      , commentPane = this.$('.js-comment-pane');

    this.$('.invalid-hint').hide();
    this.$('.incomplete-hint').hide();

    this.timeline.each(function (model) {
      if(model._name === 'Accomplishment')
        self.appendSubview(new AccomplishmentView({model: model}), accomplishmentPane);
      else {
        self.appendSubview(new CommentView({model: model}), accomplishmentPane);
        self.appendSubview(new CommentView({model: model}), commentPane);
      }
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

    socket.removeAllListeners();
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
