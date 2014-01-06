var Backbone = require('backbone')
  , $ = require('jquery-browserify')
  , bind = require('lodash.bind')
  , app;

Backbone.$ = $;

app = Backbone.Router.extend({
  initialize: function () {
    for(var key in this.routes)
      this.routes[key] = bind(this.routes[key], this);
  }
, routes: {
    '': require('./routes/index')
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
      document.body = document.createElement('body');
      appdiv = document.createElement('div');
      appdiv.setAttribute('id', 'app');
      document.body.appendChild(appdiv);
    }

    appdiv.appendChild(view.el);

    this.currentView = view;
  }
});

module.exports = app;
