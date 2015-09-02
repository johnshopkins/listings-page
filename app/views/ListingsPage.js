/* global require: false */
/* global module: false */
/* global modernBrowser: false */

var $ = require("../../shims/jquery");
var Backbone  = require("../../shims/backbone");

var imagesloaded = require("imagesloaded");
var getScriptData = require("../../lib/get-script-data");

var Views = {
  ListingsPageFilters: require("./ListingsPageFilters"),
  ListingsPageListings: require("./ListingsPageListings"),
  ListingsPageFiltersToggle: require("./ListingsPageFiltersToggle"),
  NoResults: require("./NoResults")
};

/**
 * Views.ListingsPage
 *
 * Controls pages consisting of listings,
 * such as events and classifieds
 *
 */

module.exports = Backbone.View.extend({

  filtersView: Views.ListingsPageFilters,

  isotopeOptions: {
    masonry: { gutter: ".gutter" },
    percentPosition: true,
    itemSelector: ".item",
    getSortData: {
      name: "[data-name]",
      relevance: "[data-rel] parseInt"
    },
    sortBy: "name"
  },

  imagesloaded: false,

  /**
   * Initialize a listings page. When instantiating, pass
   * in some things:
   * {
   *   filters: $(".filters"),   // optional. Defaults to $(".filters")
   *   listings: $(".obejcts"),  // optional. Defaults to $(".obejcts")
   *   models: {},               // required. Object models, matching object types
   *   views: {}                 // required. Object views, matching object types
   *   appName: ""               // options. Used for Google Analytics Event tracking as the "event category"
   * }
   *
   * pass two divs into the view (filters and listings) if
   * they are different than the defaults:
   *
   * new Views.ListingsPage({
   * 	filters: $(".filters"),
   * 	listings: $(".objects"),
   * 	models: {}
   * 	views: {}
   * });
   *
   * Inside of the filters div, there must be a <script> object with
   * a JSON-encoded array of all the filters. See the events
   * or classifieds pages for an example.
   *
   * Inside the listings div is where the listings fetched with the
   * initial page load must reside.
   *
   * @param  {obejct} options View options
   * @return null
   */
  initialize: function (options) {

    options = options || {};

    this.models = options.models;
    this.views = options.views;
    this.appName = options.appName;
    this.tabIndex = options.tabIndex || {};

    // save off a copy of the events object to scope the vent object
    // example of why: there are filters on the events page and in
    // the events page subscribe modal
    this.vent = _.extend({}, Backbone.Events);

    // save off some divs for later use
    this.filtersContainer = options.filters || $(".filters");
    this.listingsContainer = options.listings || $(".objects");

    // create filters toggle view (for mobile)
    this.filtersToggle = new Views.ListingsPageFiltersToggle({
      vent: this.vent
    });

    // create the no results view
    this.noResultsView = new Views.NoResults();
    this.listingsContainer.after(this.noResultsView.render().el);

    this.listenTo(this.vent, "filters:reset", this.resetFilters);
    this.listenTo(this.vent, "isotope:sort", this.resetSort);
    this.listenTo(this.vent, "isotope:insert", this.insert);
    this.listenTo(this.vent, "isotope:remove", this.remove);

    this.initItems(this.render);

  },

  /**
   * Apply javascript to server-side loaded items
   */
  initItems: function (callback) {

    var self = this;
    this.listingsContainer.find(".item").each(function (i, item) {

      item = $(item);
      var data = getScriptData(item);

      if (!data) return;

      var modelName = data.type;
      var viewName = data.type + "_item";

      if (!self.models[modelName] || !self.views[viewName]) return;

      var model = new self.models[modelName](data);

      new self.views[viewName]({
        el: item,
        model: model
      });

    });

    this.render();

  },

  initIsotope: function () {

    this.imagesloaded = true;
    this.listingsContainer.isotope(this.isotopeOptions);
    this.listingsContainer.isotope("on", "arrangeComplete", this.onArrangeComplete.bind(this));

    // add the filters and toggle to the filters container
    this.filtersContainer
      .append(this.filtersToggle.render().el)
      .append(this.filtersForm.render().el);

  },

  render: function () {

    // do not render filters or init isotope if this is not a modern browser
    if (typeof modernBrowser !== "undefined" && !modernBrowser) return;

    // create filters view
    var filterData = getScriptData(this.filtersContainer);
    this.filtersForm = new this.filtersView({
      data: filterData,
      vent: this.vent,
      filtersContainer: this.filtersContainer,
      tabIndex: this.tabIndex,
      appName : this.appName
    });

    // init isotope when all images are loaded
    this.listingsContainer
      .imagesLoaded()
      .done(this.initIsotope.bind(this));

  },

  resetFilters: function (filters) {

    // do not run isotope unless all images have loaded
    if (!this.imagesloaded) return;

    filters = filters || [];
    this.listingsContainer.isotope({ filter: filters.join(", ") });

  },

  resetSort: function (sort) {

    // tell isotope to run through the DOM to update its sort data (new rels)
    this.listingsContainer.isotope("updateSortData").isotope();

    // change sortBy method to relevance
    this.listingsContainer.isotope({ sortBy: sort });

  },

  /**
   * Callback that runs when Isotope finishes
   * arranging and filtering items.
   * @param  {event} e             Event
   * @param  {array} filteredItems Items that are visible
   */
  onArrangeComplete: function (filteredItems) {

    // if there are results, return
    if (filteredItems.length > 0) {
      this.noResultsView.hide()
      return;
    }

    // if the not found template is already in place, return (otherwise, infinite loop)
    if (this.noResultsView.isShowing()) return;

    // render the no results fiew
    this.noResultsView.show();

  },

  insert: function (items) {

    this.listingsContainer.isotope("insert", items);

  },

  remove: function (items) {

    this.listingsContainer.isotope("remove", items);

  },

  track: function (checkbox) {

    if (checkbox.prop("checked")) {
        var category = checkbox.parents("fieldset").data().group;
        var filter = checkbox.attr("id");

        // _gaq.push(["_trackEvent", "Events", category, filter]);
    }

  }

});
