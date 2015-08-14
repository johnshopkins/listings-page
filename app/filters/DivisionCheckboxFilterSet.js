/* global require: false */
/* global module: false */

var $ = require("../../../../../shims/jquery");
var Backbone  = require("../../../../../shims/backbone");

var Views = {
  DivisionCheckboxFilter: require("./DivisionCheckboxFilter"),
  CheckboxFilterSet: require("./FilterSet")
};

/**
 * Views.DivisionCheckboxFilterSet
 *
 */

module.exports = Views.CheckboxFilterSet.extend({

  view: Views.DivisionCheckboxFilter

});
