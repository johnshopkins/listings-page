/* global require: false */
/* global module: false */

var $ = require("../../../../../shims/jquery");
var Backbone  = require("../../../../../shims/backbone");

/**
 * Views.FilterSet
 *
 */

module.exports = Backbone.View.extend({

  tagName: "fieldset",

  initialize: function (options) {

    this.options = options;
    this.vent = options.vent;
    this.label = options.label;
    this.group = this.label.toLowerCase().replace(" ", "");
    this.hashFilters = options.hashFilters[this.group] ? options.hashFilters[this.group].split(",") : [];

  },

  createView: function (filter) {

    return new this.view({
      model: filter,
      group: this.group,
      vent: this.vent,
      options: this.options,
      hashFilters: this.hashFilters
    });

  },

  append: function (filter) {

    var view = this.createView(filter);
    this.$el.append(view.render().el);

  },

  render: function () {

    this.$el.attr("data-group", this.group);
    this.$el.append($("<legend />").append($("<h4 />").text(this.label)));

    if (this.collection) {

      this.collection.each(this.append, this);

    } else if (this.model) {

      var view = this.createView(this.model);
      this.$el.append(view.render().el);

    }

    return this;

  }

});
