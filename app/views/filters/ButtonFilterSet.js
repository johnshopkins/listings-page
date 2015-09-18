/* global require: false */
/* global module: false */

var $ = require("../../../shims/jquery");
var Backbone  = require("../../../shims/backbone");

var Views = {
  ButtonFilter: require("./ButtonFilter"),
  FilterSet: require("./FilterSet")
};

/**
 * Views.ButtonFilterSet
 *
 */

module.exports = Views.FilterSet.extend({

  view: Views.ButtonFilter,
  clearLocation: "before",
  clearText: "show all"

});
