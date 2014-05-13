/**
* Holds a single accomplishment
*/
var TimelineItem = require('../timeline-item')
  , oldContext = TimelineItem.prototype.context
  , AccomplishmentView;

AccomplishmentView = TimelineItem.extend({
  className: 'pulse-timeline-item pulse-accomplishment'
, context: function () {
    var result = oldContext.apply(this, []);
    result.isAccomplishment = true;
    return result;
  }
});

module.exports = AccomplishmentView;
