var Backbone = require('backbone')
  , Accomplishment = require('../models/accomplishment')
  , Comment = require('../models/comment')
  , Timeline;

Timeline = Backbone.Collection.extend({
  url: '/timeline'
, model: function (attrs, opts) {
    if(attrs.c) {
      delete attrs.c;

      return new Comment(attrs, opts);
    }
    else {
      return new Accomplishment(attrs, opts);
    }
  }
, parse: function (res) {
    for(var i=0, ii=res.length; i<ii; ++i)
      res[i].updated = new Date(res[i].updated);

    return res;
  }
, comparator: function (a, b) {
    var diff = a.get('updated').getTime() - b.get('updated').getTime();

    if(diff === 0) {
      if(!a.c && b.c)
        return -1;
      if(a.c && !b.c)
        return 1;
      return 0;
    }

    return diff;
  }
});

module.exports = Timeline;
