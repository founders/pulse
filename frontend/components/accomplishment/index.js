/**
* Holds a single accomplishment
*/
var Ribcage = require('ribcage-view')
  , AccomplishmentView;

AccomplishmentView = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-accomplishment'
, events: {
	'mouseover .header-right'	:	'loadRealTime',
	'mouseleave .header-right'	:	'loadRelativeTime'
}
, afterInit: function (opts) {
    if(!opts || !opts.model)
      throw new Error('This view must be initialized with an Accomplishment model');

    this.model = opts.model;
  }
, context: function () {
	var relativeDate = require('relative-date');
	var modelFields = this.model.toJSON();
	modelFields.relativeDate = relativeDate(this.model.get('updated'));
	return modelFields;
  }
, loadRealTime: function() {
	this.$('.relative-date').hide();
	this.$('.real-hidden-date').show();
  }
, loadRelativeTime: function() {
	this.$('.relative-date').show();
	this.$('.real-hidden-date').hide();
}

});

module.exports = AccomplishmentView;
