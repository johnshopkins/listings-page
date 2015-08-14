/* global require: false */
/* global module: false */
/* global vent: false */

var $ = require("../../../../shims/jquery");
var Backbone  = require("../../../../shims/backbone");

var Views = {
  checkbox: require("./filters/CheckboxFilterSet"),
  search: require("./filters/SearchFilterSet")
};

/**
 * Views.ListingsPageFilters
 *
 */

module.exports = Backbone.View.extend({

  tagName: "form",
  className: "closed",
  hashFilters: [],

  events: {
    "submit": "onSubmit"
  },

  initialize: function (options) {

    this.data = options.data;
    this.vent = options.vent;

    this.initQueryString();
    this.initHashBang();

    // active isotope filters
    this.filters = {};

    var self = this;

    this.filterViews = $.map(this.data, function (data, label) {

      var type = data.type;

      if (Views[type]) {

        if (type === "checkbox") {
          return self.createCheckbox(data, label);
        }

        if (type === "search") {
          return self.createSearch(data, label);
        }

      }

    });

    this.listenTo(this.vent, "filters:toggle", this.toggleDisplay);
    this.listenTo(this.vent, "filters:add", this.addFilter);
    this.listenTo(this.vent, "filters:remove", this.removeFilter);

  },

  /**
   * On first view of the page, parse the query string, looking
   * for searches (q=art+history) that need to be converted to
   * the #! version (/!#/search-art-history).
   *
   * Division and degree filters are already in the #!
   */
  initQueryString: function () {

    var queryString = window.location.search.replace("?", "");

    if (queryString.length === 0) return;

    var split = queryString.split("&");

    var self = this;
    $.each(split, function (i, value) {

      value = value.split("=");

      if (value[0] === "q") {
        self.hashFilters.keyword = "search-" + value[1].replace("-", " ");
      }

    });

  },

  /**
   * On first view of the page, parse the #!, looking
   * for a search term that needs to be passed to
   * the keyword filter view.
   */
  initHashBang: function () {

    var hash = window.location.hash.replace("#!/", "");

    if (hash.length === 0) return;

    var self = this;
    $.map(hash.split("&"), function (value) {

      var split = value.split("=");
      self.hashFilters[split[0]] = split[1];

    });

  },

  onSubmit: function (e) {

    e.preventDefault();

  },

  createCheckbox: function (data, label) {

    // convert each checkbox data to a backbone model
    var models = $.map(data.options, function (attributes, id) {
      return new Backbone.Model(attributes);
    });

    // create a checkbox view
    return new Views.checkbox({
      label: label,
      collection: new Backbone.Collection(models),
      vent: this.vent,
      hashFilters: this.hashFilters
    });

  },

  createSearch: function (data, label) {

    return new Views.search({
      label: label,
      model: new Backbone.Model(data),
      vent: this.vent,
      hashFilters: this.hashFilters
    });

  },

  toggleDisplay: function () {

    this.$el.toggleClass("closed");

  },

  /**
   * Activate a filter in a group of filters.
   * @param {string}  group      Group name
   * @param {string}  filter     Filter class to activate (ex: .math)
   */
  addFilter: function (group, filter) {

    // a filter from this group hadn't been selected yet; init array
    if (!this.filters[group]) this.filters[group] = [];

    // Add filter if it's not already in the array. This can happen
    // if a filter is checked and then "all" is checked

    if ($.inArray(filter, this.filters[group]) === -1) {
      this.filters[group].push(filter);
    }

    this.resetFilters();

  },

  /**
   * Remove a filter in a group of filters.
   * @param {string}  group      Group name
   * @param {string}  filter     Filter class to activate (ex: .math)
   */
  removeFilter: function (group, filter) {

    // remove filter
    var index = $.inArray(filter, this.filters[group]);

    if (index !== -1) {
      this.filters[group].splice(index, 1);
    }

    this.resetFilters();

  },

  resetFilters: function () {

    this.createHash();

    var filters = this.formatFilters();

    // reinit
    this.vent.trigger("filters:reset", filters);

  },

  getHashFilters: function () {

    var hash = [];

    var self = this;
    $.each(this.filters, function (group, filters) {

      if (filters.length) {

        // there are filters and the fake class is not one of them

        filters = $.map(filters, function (filter) {
          return filter.replace(".", "");
        });

        hash.push(group + "=" + filters.join(","));

      }

    });

    return hash;

  },

  /**
   * When filters are reset, create a #!
   * so the state can be returned to
   */
   createHash: function () {

     var hash = this.getHashFilters();
     window.location.hash = "#!/" + hash.join("&");

   },

  formatFilters: function () {
    // now comes the filtering fun

    var i = 0;
    var comboFilters = [];

    for (var groupName in this.filters) {

      // items selected in this filter group
      var filterGroup = this.filters[groupName];

      // skip to next group if nothing is checked
      if (!filterGroup.length) {
        continue;
      }

      // if the first time through, create a new array with the values checked in this group
      if (i === 0) {
        comboFilters = filterGroup;

      } else {

        var filterSelectors = [];

        // copy to fresh array
        var groupCombo = comboFilters;

        // merge filter Groups
        for (var k  = 0, len3 = filterGroup.length; k < len3; k++) {

          for (var j = 0, len2 = groupCombo.length; j < len2; j++) {
            filterSelectors.push( groupCombo[j] + filterGroup[k] ); // [ 1, 2 ]
          }

        }

        // apply filter selectors to combo filters for next group
        comboFilters = filterSelectors

      }

      i++
    }

    return comboFilters
  },

  render: function () {

    var self = this;
    _.each(this.filterViews, function (filter) {
      self.$el.append(filter.render().el);
    });

    return this;

  }

});
