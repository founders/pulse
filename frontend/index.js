var App = require('./app')
  , Backbone = require('backbone')
  , instance = new App();

// Kinda pointless, perhaps just for debugging purposes
window.App = instance;

Backbone.history.start();
