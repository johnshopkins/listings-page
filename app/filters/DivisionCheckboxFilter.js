/* global require: false */
/* global module: false */

var $ = require("../../../../../shims/jquery");
var Backbone  = require("../../../../../shims/backbone");

var Views = { CheckboxFilter: require("./CheckboxFilter") };

var templates = { divisionCheckbox: require("../../../../../templates/pages/listings/filters/division-checkbox.html") };


/**
 * Views.DivisionCheckboxFilter
 *
 * Adds the info icon to checkbox filters
 * that are part of the divison filter set.
 *
 */

var DivisionCheckboxFilter = Views.CheckboxFilter.extend({

  template: templates.divisionCheckbox,

  getChildView: function () {

    return DivisionCheckboxFilter;

  }

});

module.exports = DivisionCheckboxFilter;
