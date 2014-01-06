/* global App */

/**
* The main application window
*/
var Ribcage = require('ribcage-view')
  , User = require('../../models/user')
  , Accomplishment = require('../../models/accomplishment')
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

    this.collection = new Accomplishments([]);
    this.collection.on('add remove change', this.render, this);
    this.collection.on('error', App.handleError);
    this.collection.fetch();

    socket.on('accomplishment', function (data) {
      var accomplishment = new Accomplishment(data);
      self.appendSubview(new AccomplishmentView({model: accomplishment}), self.$('.js-main-pane'));
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
, afterRender: function () {
    var self = this
      , mainPane = this.$('.js-main-pane');

    this.collection.each(function (accomplishment) {
      self.appendSubview(new AccomplishmentView({model: accomplishment}), mainPane);
    });
  }
, sendComment: function () {
    alert('Not implemented yet ):');
  }
, sendAccomplishment: function () {
    var newAccomplishment = new Accomplishment({
      text: this.$('.js-entry-input').val()
    });

    newAccomplishment.on('error', App.handleError);

    newAccomplishment.save();
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
    this.collection.off();
    delete this.collection;
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
