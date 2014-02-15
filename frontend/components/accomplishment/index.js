/**
* Holds a single accomplishment
*/
var Ribcage = require('ribcage-view')
  , AccomplishmentView
  , bind = require('lodash.bind')
  , marked = require('marked')
  , autolinks = require('autolinks')
  , moment = require('moment');

marked.setOptions({
  sanitize: true
});

AccomplishmentView = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-accomplishment'
, loadingComments: false
, events: {
    'mouseover .signature-left'   :   'loadRealTimeHeader'
    , 'mouseleave .signature-left'  :   'loadRelativeTimeHeader'
    , 'mouseover .signature-right'  :   'loadNetId'
    , 'mouseleave .signature-right' :   'loadFullName'
  }
, intervalHandle: null
, afterInit: function (opts) {
    if(!opts || !opts.model)
      throw new Error('This view must be initialized with an Accomplishment model');

    this.accomplishment = opts.model;

    this.listenTo(this.accomplishment, 'change', this.render, this);
  }
, beforeRender: function() {
    if (this.intervalHandle)
      clearInterval(this.intervalHandle);
  }
, context: function () {
    var accomplishment = this.accomplishment.toJSON();
    var dateInMoment = moment(this.accomplishment.get('updated'));
    accomplishment.relativeDate = dateInMoment.fromNow();
    accomplishment.fullDate = dateInMoment.format('ddd. MMM DDDo YYYY, h:mm:ss a');
    if (dateInMoment.year() != moment().year())
      accomplishment.shortDate = dateInMoment.format('MM/DD/YY h:mm a');
    else
      accomplishment.shortDate = dateInMoment.format('MM/DD h:mm a');
    accomplishment.text = marked(autolinks(accomplishment.text, 'markdown'));
    console.log(this.accomplishment.get('user').email.split('@')[0]);
    accomplishment.netId = this.accomplishment.get('user').email.split('@')[0];

    return accomplishment;
  }
, afterRender: function() {
    this.intervalHandle = setInterval(bind(this.updateDates, this), 60000);
  }
, beforeClose: function() {
  if (this.intervalHandle)
    clearInterval(this.intervalHandle);
  }
, loadRealTimeHeader: function() {
    this.$('.signature-relative-date').hide();
    this.$('.signature-real-hidden-date').show();
  }
, loadRelativeTimeHeader: function() {
    this.$('.signature-relative-date').show();
    this.$('.signature-real-hidden-date').hide();
  }
, loadNetId: function() {
    this.$('.signature-user-name').hide();
    this.$('.signature-netid-hidden').show();
  }
, loadFullName: function() {
    this.$('.signature-user-name').show();
    this.$('.signature-netid-hidden').hide();
  }
, updateDates: function() {
    this.$('.js-update-signature-relative-date').text(moment(this.accomplishment.get('updated')).fromNow());
  }
});

module.exports = AccomplishmentView;
