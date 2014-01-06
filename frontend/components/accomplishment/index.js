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
    return this.model.toJSON();
  }
});

module.exports = AccomplishmentView;
