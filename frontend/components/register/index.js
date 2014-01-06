/* global alert, App */

/**
* The main application window
*/
var Ribcage = require('ribcage-view')
  , $ = require('jquery-browserify')
  , User = require('../../models/user')
  , AuthPanel;

AuthPanel = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-auth-panel'
, events: {
    'submit .js-netid-form form': 'lookupNetid'
  , 'click .js-netid-lookup': 'lookupNetid'
  , 'submit .js-reg-form form': 'registerUser'
  , 'click .js-reg': 'registerUser'
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
    var newUser;

    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    newUser = new User({
        firstname: this.$('.js-firstname').val()
      , lastname: this.$('.js-lastname').val()
      , email: this.netid + '@illinois.edu'
      , password: this.$('.js-password').val()
      });

    newUser.on('error', App.handleError);

    newUser.on('sync', function () {
      App.navigate('', {trigger: true});
    });

    newUser.save();
  }
, context: function () {
    return {
      netidError: this.netidError
    , netid: this.netid
    , details: this.detailPlaceholders
    };
  }
});

module.exports = AuthPanel;
