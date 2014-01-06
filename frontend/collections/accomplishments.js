var Backbone = require('backbone')
  , Accomplishments;

Accomplishments = Backbone.Collection.extend({
  url: '/accomplishments'
, model: require('../models/accomplishment')
});

module.exports = Accomplishments;
