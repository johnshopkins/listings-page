/* global require: false */
/* global module: false */

var $ = require("../../../shims/jquery");
var Backbone  = require("../../../shims/backbone");

var templates = { clear: require("../../../templates/filters/clear-button.html") };

/**
 * Views.ClearFilters
 *
 */

module.exports = Backbone.View.extend({

  className: "clear-button",
  template: templates.clear,

  events: {
    "click": "clearFilters"
  },

  initialize: function (options) {

    this.group = options.group;

  },

  clearFilters: function (e) {

    e.preventDefault();
    this.trigger("filters:removeset");

  },

  render: function () {

    this.$el.append(this.template());
    return this;

  }

});
