/* global require: false */
/* global module: false */
/* global vent: false */

var $ = require("../../../../shims/jquery");
var Backbone  = require("../../../../shims/backbone");

var templates = { toggle: require("../../../../templates/pages/listings/filters/toggle.html")}

/**
 * Views.ListingsPageFilter
 *
 */

module.exports = Backbone.View.extend({

  className: "display-nav closed",
  template: templates.toggle,

  events: {
    "click": "onClick"
  },

  initialize: function (options) {

    this.vent = options.vent;
    this.listenTo(this.vent, "filters:toggle", this.toggleDisplay)

  },

  onClick: function (e) {

    this.vent.trigger("filters:toggle");

  },

  toggleDisplay: function () {

    this.$el.toggleClass("closed");

  },

  render: function () {

    this.$el.append(this.template());
    return this;

  }

});
