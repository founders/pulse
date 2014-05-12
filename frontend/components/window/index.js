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
  , socket
  , MIN_ACCOMPLISHMENT_LENGTH = 30;

// set global variable for socket
var socketCount = 0;

var updateButton = function(number){
  document.querySelector('.pulse-pane h3.user-count').innerHTML = number;
}

AppWindow = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-app-window'
, events: {
    'click .js-chat': 'sendComment'
  , 'click .js-accomplishment': 'sendAccomplishment'
  , 'click .js-join': 'joinUs'
  , 'submit form': 'noop'
  , 'keyup .js-chat-input': 'handleChatKeyup'
  , 'keyup .js-accomplishment-input': 'handleAccomplishmentKeyup'
  , 'focus .js-accomplishment-input': 'handleAccomplishmentFocus'
  , 'blur .js-accomplishment-input': 'handleAccomplishmentBlur'
  }
, authenticated: false
, user: null
, afterInit: function () {
    var self = this;

    if(!socket)
      socket = io.connect('/');

    this.resetFormStash();

    this.timeline = new Timeline([]);
    this.timeline.on('error', App.handleError);

    this.timeline.fetch({
      success: function () {
        self.render();
      }
    });

    socket.on('news', function (data){
      socketCount = data;
      updateButton(data);
    });

    socket.on('accomplishment', function (data) {
      var accomplishment = new Accomplishment(Accomplishment.prototype.parse(data))
        , accomplishmentPane = self.$('.js-accomplishment-pane');

      self.timeline.add(accomplishment);
      self.prependSubview(new AccomplishmentView({model: accomplishment}), accomplishmentPane);
      self.scrollDown();
    });

    socket.on('comment', function (data) {
      var comment = new Comment(Comment.prototype.parse(data))
        , commentPane = self.$('.js-chat-pane');

      self.timeline.add(comment);
      self.appendSubview(new CommentView({model: comment}), commentPane);
      self.scrollDown();
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
    var self = this;

    // Defer this, it doesn't work reliably on initial page load ):
    setTimeout(function () {
      var accomplishmentPane = self.$('.js-accomplishment-pane')
        , commentPane = self.$('.js-chat-pane');

      accomplishmentPane.scrollTop(0);
      commentPane.scrollTop(commentPane[0].scrollHeight);
    }, 300);
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

    this.handleAccomplishmentBlur();

    if(this.formStash.accomplishment !== '')
      this.$('.js-accomplishment-input').focus();
    else
      this.$('.js-chat-input').focus();

    this.scrollDown();
  }
, sendComment: function () {
    var self = this
      , newComment = new Comment({
          text: this.$('.js-chat-input').val()
        })
      , tempSave;

    this.$('.js-chat-input').prop('disabled', true);

    newComment.on('error', function () {
      self.$('.js-chat-input').prop('disabled', false)
                              .val(tempSave);
    });

    tempSave = this.$('.js-chat-input').val();

    this.resetFormStash();

    newComment.save({}, {
      success: function () {
        self.$('.js-chat-input')
            .prop('disabled', false)
            .val('')
            .focus();
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
      self.$('.js-accomplishment-input')
          .prop('disabled', false)
          .val(tempSave);
    });

    tempSave = this.$('.js-accomplishment-input').val();

    this.resetFormStash();

    newAccomplishment.save({}, {
      success: function () {
        self.$('.js-accomplishment-input')
            .prop('disabled', false)
            .val('').focus();
      }
    });
  }
, handleChatKeyup: function (e) {
    if (event.keyCode == 13 && !event.shiftKey)
        this.sendComment(e);
  }
, handleAccomplishmentKeyup: function () {
    var str = this.$('.js-accomplishment-input').val()
      , diff = str == null ? MIN_ACCOMPLISHMENT_LENGTH : MIN_ACCOMPLISHMENT_LENGTH - str.length;

    if(diff > 0) {
      this.$('.js-accomplishment').text(diff + ' more characters to go..').prop('disabled', true);
    }
    else {
      this.$('.js-accomplishment').text('Accomplish!').prop('disabled', false);
    }
  }
, handleAccomplishmentFocus: function () {
    this.handleAccomplishmentKeyup();
    this.$('.js-accomplishment').fadeIn(300);
  }
, handleAccomplishmentBlur: function () {
    var str = this.$('.js-accomplishment-input').val()
      , diff = str == null ? MIN_ACCOMPLISHMENT_LENGTH : MIN_ACCOMPLISHMENT_LENGTH - str.length;

    if(diff > 0)
      this.$('.js-accomplishment').hide();
    else
      this.$('.js-accomplishment').fadeIn(300);
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
