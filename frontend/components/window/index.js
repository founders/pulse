/**
* The main application window
*/
var Ribcage = require('ribcage-view')
  , AppWindow;

AppWindow = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-app-window'
});

module.exports = AppWindow;
