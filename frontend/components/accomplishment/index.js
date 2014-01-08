/**
* Holds a single accomplishment
*/
var Ribcage = require('ribcage-view')
  , AccomplishmentView;

AccomplishmentView = Ribcage.extend({
  template: require('./template.hbs')
, className: 'pulse-accomplishment'
, afterInit: function (opts) {
    if(!opts || !opts.model)
      throw new Error('This view must be initialized with an Accomplishment model');

    this.model = opts.model;
  }
, context: function () {
	var relativeDate = require('relative-date');
	var modelFields = model.toJSON();
	modelFields.relativeDate = relativeDate(model.updated);
	return modelFields;
  }
});

module.exports = AccomplishmentView;
