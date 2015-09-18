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
  clearText: "show all",

  activeFilters: [],

  initialize: function (options) {

    Views.FilterSet.prototype.initialize.call(this, options);

    this.parentView = options.parentView;
    this.listenTo(this.vent, "filters:add", this.addFilter);
    this.listenTo(this.vent, "filters:remove", this.removeFilter);

  },

  addFilter: function (group, filter, slug) {

    if ($.inArray(filter, this.activeFilters) === -1) {
      this.activeFilters.push(filter);
    }

    this.clearView.deactivate();

  },

  removeFilter: function (group, filter, slug) {

    var index = $.inArray(filter, this.activeFilters);
    if (index !== -1) {
      this.activeFilters.splice(index, 1);
    }

    if (this.activeFilters.length === 0) {
      this.clearView.activate();
    }

  },

});
