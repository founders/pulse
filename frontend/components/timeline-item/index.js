/**
* Holds a single accomplishment
*/
var Ribcage = require('ribcage-view')
  , TimelineItemView
  , bind = require('lodash.bind')
  , marked = require('marked')
  , autolinks = require('autolinks')
  , moment = require('moment');

marked.setOptions({
  sanitize: true
});

TimelineItemView = Ribcage.extend({
  template: require('./template.hbs')
, className: 'timeline-item'
, events: {
    'mouseover .heading-time'   :   'loadRealTimeHeader',
    'mouseleave .heading-time'  :   'loadRelativeTimeHeader'
  }
, intervalHandle: null
, afterInit: function (opts) {
    if(!opts || !opts.model)
      throw new Error('This view must be initialized with a model');

    this.model = opts.model;
  }
, bindEvents: function () {
    this.listenTo(this.model, 'change', this.render, this);
  }
, context: function () {
    var context = this.model.toJSON()
      , dateInMoment = moment(this.model.get('updated'));

    context.relativeDate = dateInMoment.fromNow();
    context.fullDate = dateInMoment.format('ddd. MMM DDDo YYYY, h:mm:ss a');

    if (dateInMoment.year() != moment().year())
      context.shortDate = dateInMoment.format('MM/DD/YY h:mm a');
    else
      context.shortDate = dateInMoment.format('MM/DD h:mm a');

    context.text = marked(autolinks(context.text, 'markdown'));

    return context;
  }
, beforeRender: function() {
    if (this.intervalHandle)
      clearInterval(this.intervalHandle);
  }
, afterRender: function() {
    this.intervalHandle = setInterval(bind(this.render, this), 60000);
  }
, beforeClose: function() {
    if(this.intervalHandle)
      clearInterval(this.intervalHandle);
  }
, loadRealTimeHeader: function() {
    this.$('.heading-relative-date').hide();
    this.$('.heading-real-hidden-date').show();
  }
, loadRelativeTimeHeader: function() {
    this.$('.heading-relative-date').show();
    this.$('.heading-real-hidden-date').hide();
  }
});

module.exports = TimelineItemView;
