var RegPanel = require('../components/register')
  , Switcher = require('ribcage-switcher')
  , Route;

Route = function () {
  var switcher = new Switcher({
      className: 'pulse-auth-switcher'
    , depth: 2
    })
    , regPanel = new RegPanel({});

  this.show(switcher);

  switcher.setPane(0, regPanel);

  switcher.resize();
};

module.exports = Route;
