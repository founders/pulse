var RegPanel = require('../components/register')
  , Route;

Route = function () {
  var regPanel = new RegPanel({});
  this.show(regPanel);
};

module.exports = Route;
