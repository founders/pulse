/* global alert */

var Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , bind = require('lodash.bind')
  , app;

Backbone.$ = $;

app = Backbone.Router.extend({
  initialize: function () {
    for(var key in this.routes)
      this.routes[key] = bind(this.routes[key], this);

    this.handleError = bind(this.handleError, this);
  }
, routes: {
    '': require('./routes/index')
  , 'authenticate': require('./routes/authenticate')
  }
, currentView: null
, show: function (view) {
    var appdiv = document.getElementById('app');

    if(this.currentView) {
      this.currentView.close();
    }

    if(appdiv) {
      appdiv.textContent='';
    }
    else {
      appdiv = document.createElement('div');
      appdiv.setAttribute('id', 'app');
      document.body.appendChild(appdiv);
    }

    appdiv.appendChild(view.el);

    this.currentView = view;
  }
, handleError: function (model, resp) {
    var parsed;

    if(resp.status == 403)
      return this.navigate('authenticate', {trigger: true});

    try {
      parsed = JSON.parse(resp.responseText);

      if(parsed.error)
        alert('Error: ' + parsed.error);
      else
        alert('Error: ' + resp.responseText);
    }
    catch (e) {
      alert('Error: ' + resp.responseText);
    }
  }
});

module.exports = app;
