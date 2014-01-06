var App = require('./app')
  , Backbone = require('backbone')
  , instance;

window.onload = function () {
  instance = new App();

  // Useful for navigating
  window.App = instance;

  Backbone.history.start();
};
