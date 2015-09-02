/* global require: false */
/* global module: false */

var $ = require("../../../shims/jquery");
var Backbone  = require("../../../shims/backbone");

var Views = {
  ClearFilters: require("./ClearFilters")
};

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

    // array to hold child views, if any
    this.views = [];

    // view that controls the "clear" button
    this.clearView = new Views.ClearFilters({ group: this.group });
    this.listenTo(this.clearView, "filters:removeset", this.deactivateSet);

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

    this.views.push(view);

  },

  /**
   * Deactivate all filters in a set
   */
  deactivateSet: function () {

    _.each(this.views, function (view) {
      view.removeFromFilters();
    });

  },

  render: function () {

    this.$el.attr("data-group", this.group);
    this.$el.append($("<legend />").append($("<h4 />").text(this.label)));

    if (this.collection) {

      this.collection.each(this.append, this);
      this.$el.append(this.clearView.render().el);

    } else if (this.model) {

      this.append(this.model);

    }

    return this;

  }

});
