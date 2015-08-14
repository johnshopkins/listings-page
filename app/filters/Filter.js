/* global require: false */
/* global module: false */
/* global module: false */

var $ = require("../../../../../shims/jquery");
var Backbone  = require("../../../../../shims/backbone");

/**
 * Views.Filter
 *
 */

module.exports = Backbone.View.extend({

  className: "filter",

  events: {
    "change": "onChange"
  },

  initialize: function (options) {

    this.filters = [];
    this.vent = options.vent;
    this.group = options.group;
    this.hashFilters = options.hashFilters;

  },

  onChange: function () {



  },

  render: function () {

    this.model.set("uniqueId", this.cid);
    this.$el.append(this.template(this.model.toJSON()));
    return this;

  }

});
