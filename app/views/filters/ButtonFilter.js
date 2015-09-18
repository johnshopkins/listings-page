/* global require: false */
/* global module: false */

var $ = require("../../../shims/jquery");
var Backbone  = require("../../../shims/backbone");

var Views = { Filter: require("./Filter") };

var templates = { button: require("../../../templates/filters/button.html") };


/**
 * Views.ButtonFilter
 *
 */

module.exports = Views.Filter.extend({

  template: templates.button,

  events: {
    "click": "onChange"
  },

  initialize: function (options) {

    Views.Filter.prototype.initialize.call(this, options);

    this.useHash = options.useHash;

  },

  onChange: function (e) {

    e.stopPropagation();
    // e.preventDefault(); // do not use this -- it prevents < IE8 from checking the checkbox

    if ($(e.target).is("a")) e.preventDefault();

    Views.Filter.prototype.onChange.call(this, e);

    var active = this.model.get("active");

    console.log(active);

    if (!active) {
      this.activateFilter();
    } else {
      this.deactivateFilter();
    }

  },

  track: function () {

    this.vent.trigger("filters:trackevent", this.model.get("name"));

  },

  setState: function () {

    var active = false;

    // if there are init filters AND this checkbox is in them
    if (this.useHash && this.hashFilters.length && $.inArray(this.slug, this.hashFilters) > -1) {
      active = true;
    }

    this.model.set("active", active);

    return active;

  },

  render: function () {

    this.slug = this.model.get("slug");

    Views.Filter.prototype.render.call(this);

    this.button = this.$el.find("button");

    var active = this.setState();
    if (active) this.activateFilter();

    return this;

  },

  activateFilter: function () {

    this.$el.addClass("active");
    this.model.set("active", true);

    this.vent.trigger("filters:add", this.group, this.button.val(), this.slug);

    this.track();

  },

  deactivateFilter: function () {

    this.$el.removeClass("active");
    this.model.set("active", false);

    this.vent.trigger("filters:remove", this.group, this.button.val(), this.slug);

  },

  /**
   * Triggered when a filter set's clear button
   * is clicked. Deactivates all filters in the set.
   */
  removeFromFilters: function () {

    // deactivate the filter
    this.deactivateFilter();

  }

});
