var Backbone = require('backbone')
  , User;

User = Backbone.Model.extend({
  url: '/users'
});

module.exports = User;
