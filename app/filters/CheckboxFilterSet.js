/* global require: false */
/* global module: false */

var $ = require("../../../../../shims/jquery");
var Backbone  = require("../../../../../shims/backbone");

var Views = {
  CheckboxFilter: require("./CheckboxFilter"),
  FilterSet: require("./FilterSet")
};

/**
 * Views.CheckboxFilterSet
 *
 */

module.exports = Views.FilterSet.extend({

  view: Views.CheckboxFilter

});
