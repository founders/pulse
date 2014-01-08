var Backbone = require('backbone')
  , Comments;

Comments = Backbone.Collection.extend({
  model: require('../models/comment')
, initialize: function (models, opts) {
    if(models)
      this.reset(models);

    if(!opts.accomplishment_id)
      throw new Error('Comments must be initialized with an accomplishment id');

    this.accomplishment_id = opts.accomplishment_id;

    this.url = '/comments?after=' + this.accomplishment_id;
  }
, parse: function (res) {
    for(var i=0, ii=res.length; i<ii; ++i)
      res[i].updated = new Date(res[i].updated);

    return res;
  }
, comparator: function (a, b) {
    return a.get('updated').getTime() - b.get('updated').getTime();
  }
});

module.exports = Comments;
