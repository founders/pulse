var AppWindow = require('../components/window')
  , Route;

Route = function () {
  var newWindow = new AppWindow({});
  this.show(newWindow);
};

module.exports = Route;
