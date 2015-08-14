/* global module: false */

var ExploreQuery = function () {};

/**
 * Get the Elasticsearch query object for the
 * main set of results, which focuses on fields
 * of study and/or clubs.
 * @param string} q Query
 */
ExploreQuery.prototype.getMain = function (q) {

  return {
    query: {
      multi_match: {
        query: q,
        type: "best_fields",
        fields: [
          "post_title^3",
          "description^2",
          "summary",
          "tags^3",
          "concentrations",
          "majors",
          "minors",
          "what_you_can_do"
        ]
      }
    }
  };

};

ExploreQuery.prototype.getCannedResponses = function (q) {

  return {
    query : {
      match: {
        keywords: q
      }
    }
  };

};

/**
 * Get the Elasticsearch query object for the
 * set of related results, which focuses on
 * people and facts.
 * @param {string} q     Query
 * @param {array}  focus Focus of explore. Possible values
 *                       are "field_of_study" and/or "club"
 */
ExploreQuery.prototype.getRelated = function (q, focus) {

  var shoulds = [];
  var person_shoulds = [];

  // find related facts
  shoulds.push({
    bool: {
      should: {
        multi_match: {
          query: q,
          type: "best_fields",
          fields: [
            "description^2",
            "tags^3",
            "post_title"
          ]
        }
      }
    }
  });

  // find related people
  person_shoulds.push({
    bool: {
      should: [
        {
          nested: {
            path: "featured_quote",
            score_mode: "avg",
            query: {
              multi_match: {
                query: q,
                type: "best_fields",
                fields: ["featured_quote.meta.quote^3"]
              }
            }
          }
        },
        {
          nested: {
            path: "long_quote",
            score_mode: "avg",
            query: {
              multi_match: {
                query: q,
                type: "best_fields",
                fields: [
                  "long_quote.meta.quote^3"
                ]
              }
            }
          }
        }
      ]
    }
  });

  if ($.inArray("field_of_study", focus > -1)) {

    person_shoulds.push({

      bool: {
        should: [
          {
            nested: {
              path: "major",
              query: {
                multi_match: {
                  query: q,
                  type: "best_fields",
                  fields: [
                    "major.post_title^3",
                    "major.meta.tags^3",
                    "major.meta.concentrations",
                    "major.meta.majors",
                    "major.meta.minors"
                  ]
                }
              }
            }
          },
          {
            nested: {
              path: "minor",
              query: {
                multi_match: {
                  query: q,
                  type: "best_fields",
                  fields: [
                    "minor.post_title^3",
                    "minor.meta.tags^3",
                    "minor.meta.concentrations",
                    "minor.meta.majors",
                    "minor.meta.minors"
                  ]
                }
              }
            }
          }
        ]
      }
    });

  }

  if ($.inArray("club", focus > -1)) {
    person_shoulds.push({
      bool: {
        should: [
          {
            nested: {
              path: "club",
              query: {
                multi_match: {
                  query: q,
                  type: "best_fields",
                  fields: [
                    "club.post_title"
                  ]
                }
              }
            }
          }
        ]
      }
    });
  }

  shoulds.push({
    bool: {
      should: person_shoulds
    }
  });

  return {
    query: {
      bool: {
        should: shoulds
      }
    }
  };

};

/**
 * Get the Elasticsearch query object for
 * supplemental search results on /search
 * majors and minors
 * @param {string} q     Query
 */
ExploreQuery.prototype.getSupplemental = function (q) {

  return {
    query: {
      multi_match: {
        query: q,
        type: "best_fields",
        fields: [
          "post_title^3",
          "description^2",
          "summary",
          "tags^3"
        ]
      }
    }
  };

};

/**
 * Get the Elasticsearch query object for the
 * a search run on people looking for specific
 * majors and minors
 * @param {string} q     Major/minor ID
 */
ExploreQuery.prototype.getPeople = function (q) {

  return {
    query: {
      bool: {
        should: [
          {
            nested: {
              path: "major",
              query: {
                match: {
                  "major.id": {
                    query: q,
                    boost: 2
                  }
                }
              }
            }
          },
          {
            nested: {
              path: "minor",
              query: {
                match: {
                  "major.id": {
                    query: q
                    // boost: 2
                  }
                }
              }
            }
          }
        ]
      }
    }
  };

};

module.exports = new ExploreQuery();
