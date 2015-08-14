module.exports = {

  // views you can extend
  views: {

    ListingsPage: require("./app/views/ListingsPage"),
    ListingsPageFilters: require("./app/views/ListingsPageFilters"),
    NoResults: require("./app/views/NoResults"),

    filters: {
      CheckboxFilter: require("./app/views/filters/CheckboxFilter"),
      CheckboxFilterSet: require("./app/views/filters/CheckboxFilterSet"),
      SearchFilter: require("./app/views/filters/SearchFilter"),
      SearchFilterSet: require("./app/views/filters/SearchFilterSet")
    }

  }

};
