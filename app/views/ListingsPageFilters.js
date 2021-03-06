/* global require: false */
/* global module: false */
/* global vent: false */
/* gloal dataLayer: false */

var $ = require("../../shims/jquery");
var Backbone  = require("../../shims/backbone");
var WindowResizeWatcher = require("window-resize-watcher");

var Views = {
  button: require("./filters/ButtonFilterSet"),
  checkbox: require("./filters/CheckboxFilterSet")
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

    if (!this.data) return;

    this.vent = options.vent;
    this.filtersContainer = options.filtersContainer;
    this.tabIndex = options.tabIndex;
    this.appName = options.appName;
    this.labelStyle = options.labelStyle;
    this.useHash = typeof options.useHash === "undefined" ? true : options.useHash;

    this.initQueryString();
    this.initHashBang();

    // active isotope filters
    this.filters = {};

    // hash slugs
    this.slugs = {};

    // breakpoint
    this.breakpoint = "hand";

    var self = this;
    this.filterViews = $.map(this.data, function (data, label) {

      var type = data.type;

      var functionName = "create" + self.capitalizeFirstLetter(type);

      if (self[functionName]) {
        return self[functionName].call(self, data, label);
      } else {
        return null;
      }

    });

    var resizer = new WindowResizeWatcher(this.vent);
    $(window).on("resize", resizer.handleResize.bind(resizer));

    this.listenTo(this.vent, "winresize:done", this.updateBreakpoint);
    this.listenTo(this.vent, "filters:toggle", this.toggleDisplay);
    this.listenTo(this.vent, "filters:add", this.addFilter);
    this.listenTo(this.vent, "filters:remove", this.removeFilter);
    this.listenTo(this.vent, "filters:removegroup", this.removeFilterGroup);
    this.listenTo(this.vent, "filters:trackevent", this.trackEvent);

  },

  trackEvent: function (filterName) {

    dataLayer.push({
      'event': 'listingsFilterClick',
      'appName': this.appName || 'Listings',
      'filterName': filterName
    });

  },

  capitalizeFirstLetter: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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

  createButton: function (data, label) {

    // convert each button data to a backbone model
    var self = this;
    var models = $.map(data.options, function (attributes, id) {
      attributes.tabIndex = self.tabIndex.button || "input";
      attributes.labelStyle = self.labelStyle;
      return new Backbone.Model(attributes);
    });

    // create a button view
    return new Views.button({
      label: label,
      collection: new Backbone.Collection(models),
      vent: this.vent,
      hashFilters: this.hashFilters,
      useHash: this.useHash
    });

  },

  createCheckbox: function (data, label) {

    // convert each checkbox data to a backbone model
    var self = this;
    var models = $.map(data.options, function (attributes, id) {
      attributes.tabIndex = self.tabIndex.checkbox || "input";
      attributes.labelStyle = self.labelStyle;
      return new Backbone.Model(attributes);
    });

    // create a checkbox view
    return new Views.checkbox({
      label: label,
      collection: new Backbone.Collection(models),
      vent: this.vent,
      hashFilters: this.hashFilters,
      useHash: this.useHash
    });

  },

  updateBreakpoint: function () {

    this.breakpoint = $("#breakpoint .width :visible").attr("class");

    if ($.inArray(this.breakpoint, ["hand", "lap"]) > -1 && this.$el.hasClass("closed")) {
      this.$el.attr("aria-hidden", true);
    } else {
      this.$el.removeAttr("aria-hidden");
    }

  },

  toggleDisplay: function () {

    this.$el.toggleClass("closed");

    if ($.inArray(this.breakpoint, ["hand", "lap"]) > -1 && this.$el.hasClass("closed")) {
      this.$el.attr("aria-hidden", true);
    } else {
      this.$el.removeAttr("aria-hidden");
    }

  },

  /**
   * Activate a filter in a group of filters.
   * @param {string}  group      Group name
   * @param {string}  filter     Filter class to activate (ex: .math)
   * @param {string}  slug       Slug of filter that triggered the remove action
   *                             Used to create hash
   */
  addFilter: function (group, filter, slug) {

    // a filter from this group hadn't been selected yet; init array
    if (!this.filters[group]) this.filters[group] = [];

    // Add filter if it's not already in the array
    if ($.inArray(filter, this.filters[group]) === -1) {
      this.filters[group].push(filter);
    }


    // a filter from this group hadn't been selected yet; init slugs array
    if (!this.slugs[group]) this.slugs[group] = [];

    // add slug if it's not already present
    if ($.inArray(slug, this.slugs[group]) === -1) {
      this.slugs[group].push(slug);
    }

    this.resetFilters();

  },

  /**
   * Remove a filter in a group of filters.
   * @param {string}  group      Group name
   * @param {string}  filter     Filter class to activate (ex: .math)
   * @param {string}  slug       Slug of filter that triggered the remove action
   *                             Used to create hash
   */
  removeFilter: function (group, filter, slug) {

    // remove filter
    var index = $.inArray(filter, this.filters[group]);
    if (index !== -1) {
      this.filters[group].splice(index, 1);
    }

    // remove slug
    index = $.inArray(slug, this.slugs[group]);
    if (index !== -1) {
      this.slugs[group].splice(index, 1);
    }

    this.resetFilters();

  },

  removeFilterGroup: function (group) {

    this.filters[group] = [];
    this.slugs[group] = [];

    this.resetFilters();

  },

  resetFilters: function () {

    if (this.useHash) this.createHash();

    var filters = this.formatFilters();

    // reinit
    this.vent.trigger("filters:reset", filters);

  },

  getHashSlugs: function () {

    var hashSlugs = [];

    $.each(this.slugs, function (group, slugs) {

      if (slugs.length) hashSlugs.push(group + "=" + slugs.join(","));

    });

    return hashSlugs;

  },

  /**
   * When filters are reset, create a #!
   * so the state can be returned to
   */
   createHash: function () {

     var slugs = this.getHashSlugs();
     window.location.hash = "#!/" + slugs.join("&");

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
        comboFilters = filterSelectors;

      }

      i++;
    }

    return comboFilters;
  },

  render: function () {

    this.breakpoint = $("#breakpoint .width :visible").attr("class");

    if ($.inArray(this.breakpoint, ["hand", "lap"]) > -1) {
      this.$el.attr("aria-hidden", true);
    }

    var self = this;
    _.each(this.filterViews, function (filter) {
      self.$el.append(filter.render().el);
    });

    return this;

  }

});
