module.exports = {

  // views you can extend
  views: {

    ListingsPage: require("./app/views/ListingsPage"),
    ListingsPageFilters: require("./app/views/ListingsPageFilters"),
    NoResults: require("./app/views/NoResults"),

    filters: {
      CheckboxFilter: require("./app/views/filters/CheckboxFilter"),
      CheckboxFilterSet: require("./app/views/filters/CheckboxFilterSet"),
      Filter: require("./app/views/filters/Filter"),
      FilterSet: require("./app/views/filters/FilterSet"),
      SearchFilter: require("./app/views/filters/SearchFilter"),
      SearchFilterSet: require("./app/views/filters/SearchFilterSet")
    }

  }

};
