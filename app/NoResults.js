/* global require: false */
/* global module: false */

var Backbone  = require("../../../../shims/backbone");

var templates = { noresults: require("../../../../templates/pages/listings/noresults.html") };

/**
 * Views.NoResults
 *
 * Controls the display of the no results message
 *
 */

module.exports = Backbone.View.extend({

  template: templates.noresults,
  className: "noresults column",

  isShowing: function () {

    return this.$el.hasClass("show");

  },

  show: function () {

    this.$el.addClass("show");

  },

  hide: function () {

    this.$el.removeClass("show");

  },

  render: function () {

    this.$el.append(this.template());
    return this;

  }

});
