/* global require: false */
/* global module: false */

var $ = require("../../../shims/jquery");
var Backbone  = require("../../../shims/backbone");

var Views = { Filter: require("./Filter") };

var templates = { checkbox: require("../../../templates/filters/checkbox.html") };


/**
 * Views.CheckboxFilter
 *
 */

var CheckboxFilter = Views.Filter.extend({

  template: templates.checkbox,

  initialize: function (options) {

    Views.Filter.prototype.initialize.call(this, options);

    this.parentView = options.parent;
    this.childViews = [];

    // add icon click event
    this.events["click .toggle-expand"] = "iconClick";

  },

  iconClick: function (e) {

    this.toggleIcon.toggleClass("fa-minus-square-o fa-plus-square-o");
    this.childFilters.toggleClass("open");

  },

  onChange: function (e) {

    e.stopPropagation();
    e.preventDefault();

    Views.Filter.prototype.onChange.call(this, e);

    var target = $(e.target);

    var checked = target.prop("checked");

    if (checked) {
      this.activateFilter();
    } else {
      this.deactivateFilter();
    }

  },

  /**
   * Sets the parentElement attribute to true if this
   * checkbox if a parent category. Sets to false if this
   * checkbox is a subcategory.
   *
   * This attribute determines whether the expand icon
   * displays or not.
   */
  setParentElementAttr: function () {

    this.children = this.model.get("children");

    if (this.children) {
      this.model.set("parentElement", true);
      this.$el.addClass("parent-level");
      this.open = false;
    } else {
      this.model.set("parentElement", false);
    }

  },

  setCheckedAttr: function () {

    var checked = false;

    // if there are init filters AND this checkbox is in them
    if (this.hashFilters.length && $.inArray(this.slug, this.hashFilters) > -1) {
      checked = true;
    }

    this.model.set("checked", checked);

  },

  getChildView: function () {

    return CheckboxFilter;

  },

  render: function () {

    this.slug = this.model.get("slug");

    this.setParentElementAttr();
    this.setCheckedAttr();

    Views.Filter.prototype.render.call(this);

    this.input = this.$el.find("input");

    // if the input is checked, activate the filter
    if (this.input.prop("checked")) this.activateFilter();


    if (this.children) {

      // create child filter views

      // save off icon for later toggline
      this.toggleIcon = this.$el.find(".toggle-expand");

      // create .child-filters div to store filters in
      this.childFilters = $("<div />").addClass("child-filters");
      this.$el.append(this.childFilters);

      var self = this;

      this.childViews = [];

      $.each(this.children, function (id, child) {

        child.parentElement = false;
        child.tabIndex = self.model.get("tabIndex");

        var model = new Backbone.Model(child);
        var viewName = self.getChildView();

        var view = new viewName({
          model: model,
          group: self.group,
          vent: self.vent,
          hashFilters: self.hashFilters,
          parent: self
        });

        self.childViews.push(view);
        self.childFilters.append(view.render().el);

      });

    }

    return this;

  },

  isChildFilter: function () {

    return this.parentView ? true : false;

  },

  activateFilter: function () {

    this.$el.addClass("active");

    if (this.isChildFilter()) {

      // activate .parent.child filter
      this.vent.trigger("filters:add", this.group, this.parentView.input.val() + this.input.val(), this.slug);

      // deactivate .parent filter
      this.vent.trigger("filters:remove", this.group, this.parentView.input.val(), this.parentView.slug);

    } else {

      // activate filter if no children are selected

      var children = this.$el.find(".child-filters");
      var checkedChildren = children.find("input:checked").length;

      if (!checkedChildren) this.vent.trigger("filters:add", this.group, this.input.val(), this.slug);

    }

  },

  deactivateFilter: function () {

    this.$el.removeClass("active");

    if (this.isChildFilter()) {

      // remove .parent.child filter
      this.vent.trigger("filters:remove", this.group, this.parentView.input.val() + this.input.val(), this.slug);


      // if no other siblings are checked and the parent is checked, add .parent back

      var siblings = this.$el.siblings(".filter");
      var checkedSiblings = siblings.find("input:checked").length;
      var parent = this.parentView.input;

      if (!checkedSiblings && parent.prop("checked")) {
        this.vent.trigger("filters:add", this.group, this.parentView.input.val(), this.parentView.slug);
      }

    } else {

      // remove this filter
      this.vent.trigger("filters:remove", this.group, this.input.val(), this.slug);

    }

  },

  /**
   * Triggered when a filter set's clear button
   * is clicked. Deactivates all filters in the set.
   */
  removeFromFilters: function () {

    // check the input
    this.input.prop("checked", false);

    // deactivate the filter
    this.deactivateFilter();

    // deactivate all children
    _.each(this.childViews, function (view) {

      view.input.prop("checked", false);
      view.deactivateFilter();

    });

  }

});

module.exports = CheckboxFilter;
