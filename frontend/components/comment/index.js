/**
* Holds a single accomplishment
*/
var TimelineItem = require('../timeline-item')
  , CommentView;

CommentView = TimelineItem.extend({
  className: 'pulse-timeline-item pulse-comment'
  // Disable rollover for comments
, events: {}
});

module.exports = CommentView;
