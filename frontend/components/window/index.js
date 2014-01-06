/* global App */

/**
* The main application window
*/
var Ribcage = require('ribcage-view')
  , Accomplishment = require('../../models/accomplishment')
  , Accomplishments = require('../../collections/accomplishments')
  , AccomplishmentView = require('../accomplishment')
  , AppWindow
  , io = require('socket.io-browserify');

AppWindow = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-app-window'
, events: {
    'click .js-comment': 'sendComment'
  , 'click .js-accomplish': 'sendAccomplishment'
  , 'keyup .js-entry-input': 'handleFormKeyup'
  , 'submit form': 'noop'
  }
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
});

module.exports = AppWindow;
