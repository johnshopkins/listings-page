/* global require: false */
/* global module: false */

var $ = require("../../../shims/jquery");
var Backbone  = require("../../../shims/backbone");

var Views = {
  SearchFilter: require("./SearchFilter"),
  FilterSet: require("./FilterSet")
};

/**
 * Views.SearchFilterSet
 *
 */

module.exports = Views.FilterSet.extend({

  view: Views.SearchFilter

});
