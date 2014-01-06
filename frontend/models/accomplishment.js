var Backbone = require('backbone')
  , Accomplishment;

Accomplishment = Backbone.Model.extend({
  url: '/accomplishments'
, parse: function (resp) {
    if(resp && resp.updated && typeof resp.updated == 'string')
      resp.updated = new Date(resp.updated);

    return resp;
  }
});

module.exports = Accomplishment;
