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
  , $ = require('jquery')
  , socket;

AppWindow = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-app-window'
, events: {
    'click .js-chat': 'sendComment'
  , 'click .js-accomplishment': 'sendAccomplishment'
  , 'click .js-join': 'joinUs'
  , 'submit form': 'noop'
  , 'keyup .js-chat-input': 'handleChatKeyup'
  }
, authenticated: false
, user: null
, afterInit: function () {
    var self = this;

    if(!socket)
      socket = io.connect('/');

    this.resetFormStash();

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
, resetFormStash: function () {
    this.$('.js-chat-input').val('');
    this.$('.js-accomplishment-input').val('');

    this.formStash = {
      accomplishment: ''
    , chat: ''
    };

  }
, scrollDown: function () {
    var accomplishmentPane = this.$('.js-accomplishment-pane')
      , commentPane = this.$('.js-chat-pane');

    accomplishmentPane.scrollTop(0);
    commentPane.scrollTop(commentPane[0].scrollHeight);
  }
, beforeRender: function () {
    // Stash form contents!
    this.formStash = {
      accomplishment: this.$('.js-accomplishment-input').val()
    , chat: this.$('.js-chat-input').val()
    };
  }
, afterRender: function () {
    var self = this
      , accomplishmentPane = this.$('.js-accomplishment-pane')
      , commentPane = this.$('.js-chat-pane');

    this.timeline.each(function (model) {
      if(model._name === 'Accomplishment')
        self.prependSubview(new AccomplishmentView({model: model}), accomplishmentPane);
      else {
        self.appendSubview(new CommentView({model: model}), commentPane);
      }
    });

    if(this.formStash.accomplishment !== '')
      this.$('.js-accomplishment-input').focus();
    else
      this.$('.js-chat-input').focus();
  }
, sendComment: function () {
    var self = this
      , newComment = new Comment({
          text: this.$('.js-chat-input').val()
        })
      , tempSave;

    this.$('.js-chat-input').prop('disabled', true);

    newComment.on('error', function () {
      self.$('.js-chat-input').prop('disabled', false);
      self.$('.js-chat-input').val(tempSave);
    });

    tempSave = this.$('.js-chat-input').val();

    this.resetFormStash();

    newComment.save({}, {
      success: function () {
        self.$('.js-chat-input').prop('disabled', false);
      }
    });
  }
, sendAccomplishment: function () {
    var self = this
      , newAccomplishment = new Accomplishment({
          text: this.$('.js-accomplishment-input').val()
        })
      , tempSave;

    this.$('.js-accomplishment-input').prop('disabled', true);

    newAccomplishment.on('error', function () {
      self.$('.js-accomplishment-input').prop('disabled', false);
      self.$('.js-accomplishment-input').val(tempSave);
    });

    tempSave = this.$('.js-accomplishment-input').val();

    this.resetFormStash();

    newAccomplishment.save({}, {
      success: function () {
        self.$('.js-accomplishment-input').prop('disabled', false);
      }
    });
  }
, handleChatKeyup: function (e) {
    if (event.keyCode == 13 && !event.shiftKey)
        this.sendComment(e);
  }
, joinUs: function (e) {
    e.preventDefault();
    e.stopPropagation();
    App.navigate('/authenticate', {trigger: true});
  }
, beforeClose: function () {
    this.timeline.off();
    delete this.timeline;

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
    , formStash: this.formStash
    };
  }
});

module.exports = AppWindow;
