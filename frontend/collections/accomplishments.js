var Backbone = require('backbone')
  , Accomplishments;

Accomplishments = Backbone.Collection.extend({
  url: '/accomplishments'
, model: require('../models/accomplishment')
, parse: function (res) {
    for(var i=0, ii=res.length; i<ii; ++i)
      res[i].updated = new Date(res[i].updated);

    return res;
  }
, comparator: function (a, b) {
    return a.get('updated').getTime() - b.get('updated').getTime();
  }
});

module.exports = Accomplishments;
