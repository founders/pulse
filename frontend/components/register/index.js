/* global alert, App */

/**
* The main application window
*/
var Ribcage = require('ribcage-view')
  , $ = require('jquery-browserify')
  , User = require('../../models/user')
  , Topbar = require('ribcage-top-bar')
  , BackButton = require('ribcage-back-button')
  , AuthPanel;

AuthPanel = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-auth-panel'
, events: {
    'submit .js-netid-form form': 'lookupNetid'
  , 'click .js-netid-lookup': 'lookupNetid'
  , 'submit .js-reg-form form': 'registerUser'
  , 'click .js-reg': 'registerUser'
  , 'submit .js-login-form form': 'loginUser'
  , 'click .js-login': 'loginUser'
  , 'click .js-cancel': 'cancelAuth'
  }
, afterRender: function () {
    var topBar = new Topbar({})
      , back = new BackButton({
        action: function () {
          App.navigate('', {trigger: true});
        }
      });

    topBar.setLeftButton(back);
    this.appendSubview(topBar, this.$('.top-bar-holder'));

    this.$('.js-netid').focus();
  }
, lookupNetid: function (e) {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    var netid = this.$('.js-netid').val()
      , self = this;

    this.$('.js-netid-lookup').prop('disabled', true).text('Searching...');

    $.ajax('/whois/' + netid, {
      dataType: 'json'
    , statusCode: {
        200: function (data) {
          self.netidError = false;
          self.netid = netid;
          self.detailPlaceholders = data;
          self.render();
          self.$('.js-password').focus();
        }
      , 404: function () {
          self.netidError = true;
          self.render();
          self.$('.js-netid').focus();
        }
      , 500: function (a, status) {
          self.netidError = true;
          alert('Error: ' + status);
          self.render();
          self.$('.js-netid').focus();
        }
      }
    });
  }
, registerUser: function (e) {
    var newUser
      , self = this;

    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.$('.js-reg').prop('disabled', true).text('Registering...');

    newUser = new User({
        firstname: this.$('.js-firstname').val()
      , lastname: this.$('.js-lastname').val()
      , email: this.netid + '@illinois.edu'
      , password: this.$('.js-password').val()
      });

    newUser.on('error', function () {
      App.handleError.apply(App, arguments);

      self.$('.js-reg').prop('disabled', false).text('Join Us');
    });

    newUser.on('sync', function () {
      App.navigate('', {trigger: true});
    });

    newUser.save();
  }
, loginUser: function (e) {
    var self = this;

    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.$('.js-login').prop('disabled', true).text('Authenticating...');

    $.ajax('/login', {
      type: 'POST'
    , data: {
        email: this.netid + '@illinois.edu'
      , password: this.$('.js-password').val()
      }
    , dataType: 'json'
    , statusCode: {
        200: function () {
          App.navigate('', {trigger: true});
        }
      , 403: function () {
          self.$('.js-password').addClass('invalid');
          self.$('.js-login').prop('disabled', false).text('Sign In');
        }
      }
    });
  }
, context: function () {
    return {
      netidError: this.netidError
    , netid: this.netid
    , details: this.detailPlaceholders
    };
  }
, cancelAuth: function (e) {
    e.preventDefault();
    e.stopPropagation();
    App.navigate('', {trigger: true});
  }
});

module.exports = AuthPanel;
