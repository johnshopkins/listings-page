/* global require: false */
/* global module: false */

var $ = require("../../../shims/jquery");
var Backbone  = require("../../../shims/backbone");

var Elasticsearch = require("../../../lib/elasticsearch");
var exploreQuery = require("../../../lib/explore-query");
var processResults = require("../../../lib/elasticsearch-process-results");

var Views = { Filter: require("./Filter") };

var templates = { search: require("../../../templates/filters/search.html") };


/**
 * Views.SearchFilter
 *
 */

module.exports = Views.Filter.extend({

  template: templates.search,
  filter: "",
  matches: [],

  initialize: function (options) {

    Views.Filter.prototype.initialize.call(this, options);

    this.elasticsearch = new Elasticsearch();

    // add icon click event
    this.events["keydown input"] = "onKeyDown";
    this.events["focus input"] = "clearKeyword";
    this.events["click .clear-button"] = "clearKeyword";
    this.events["click .submit-button"] = "searchByKeyword";

  },

  render: function () {

    Views.Filter.prototype.render.call(this);
    this.input = this.$el.find("input[name=q]");

    if (this.hashFilters.length) {
      var q = this.hashFilters[0].replace("search-", "").replace("-", " ");
      this.input.val(q)
      this.searchByKeyword();
    }

    return this;

  },

  /**
   * Watch for the pressing of the "enter" key
   * when a user is typing in the input.
   */
  onKeyDown: function (e) {

    var code = e.charCode ? e.charCode : e.keyCode;

    if (code !== 13) return;

    // keyword searched for
    this.searchByKeyword();

  },

  clearKeyword: function () {

    this.input.val("");

    /**
     * Delay deactivating the filter just enough to give
     * the input the time to clear. If this timeout is not
     * used, the input doesn't clear until Isotope finishes
     * its filtering process.
     */
    var self = this;
    setTimeout(this.deactivateFilter.bind(this), 5);

  },

  searchByKeyword: function () {

    if (this.matches) this.deactivateFilter();

    var q = this.input.val();

    // remove focus from input to aid in "focus" envent
    this.input.blur();

    if (!q) return;

    this.filter = "search-" + this.createDomFriendlyKeyword(q);

    var data = exploreQuery.getMain(q);

    var self = this;
    this.elasticsearch.search(["field_of_study", "search_response"], data).done(function (results) {

      results = processResults(results.hits.hits, { percentage: 0.3 });

      $.each(results, function (i, match) {

        var item = $("#field-" + match._id);

        // add .search-match class and relevancy data
        item
          .addClass(self.filter)
          .attr("data-rel", i + 1);

        // push this item into an array so class and relevancy data can be removed later
        self.matches.push(item);

      });

      // update sort method to sort by item relevance
      self.vent.trigger("isotope:sort", "relevance");

      self.activateFilter();

    });

    // Send event to google
    this.sendRequestToGoogle(q);

  },

  activateFilter: function () {

    // activate 'clear' button
    this.$el.addClass("clear");

    // add filter
    this.vent.trigger("filters:add", this.group, "." + this.filter, this.filter);

  },

  deactivateFilter: function () {

    // activate 'explore' button
    this.$el.removeClass("clear");

    // update sort method to sort by item name
    this.vent.trigger("isotope:sort", "name");

    // remove this filter
    this.vent.trigger("filters:remove", this.group, "." + this.filter, this.filter);

    // remove class and relevancy data from items
    var self = this;
    $.each(this.matches, function (i, match) {
      $(match)
        .removeClass(self.filter)
        .attr("data-rel", 0);
    });

    // reset matches and filter name
    this.matches = [];
    this.filter = "";

  },

  /**
   * Sends a reqest to /explore so that the search
   * is tracked in Google Analytics. This results in
   * a little more work for the client, but the same
   * data is being fetched from the API, so the caching
   * will help on processing. Not a perfect solution,
   * but this is the best I could think of today -jw
   *
   * @param {string} q     Query
   */
  sendRequestToGoogle: function (q) {

    var location = window.location;

    var path = location.pathname;

    // remove trailing slash
    if (path.substr(-1) == '/') {
      path = path.substr(0, path.length - 1);
    }

    var url = location.protocol + "//" + location.hostname + path + "?q=" + q + "&c=" + this.model.get("category");

    this.vent.trigger("filters:tracksearch", url);

  },

  /**
   * Remove anything that isn't a letter, number,
   * hyphen, or a space and convert spaces to hypnes.
   * @param {[type]} keyword [description]
   */
  createDomFriendlyKeyword: function (keyword) {
    return keyword.replace(/[^A-Za-z0-9-\s]*/g, "").replace(/\s+/g, "-");
  }

});
