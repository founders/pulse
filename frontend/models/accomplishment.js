var Backbone = require('backbone')
  , Accomplishment;

Accomplishment = Backbone.Model.extend({
  url: '/accomplishments'
});

module.exports = Accomplishment;
