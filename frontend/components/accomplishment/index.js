/**
* Holds a single accomplishment
*/
var TimelineItem = require('../timeline-item')
  , AccomplishmentView;

AccomplishmentView = TimelineItem.extend({
  className: 'pulse-timeline-item pulse-accomplishment'
});

module.exports = AccomplishmentView;
