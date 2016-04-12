/* global require: false */
/* global module: false */

var $ = require("../shims/jquery");

var Elasticsearch = function () {

  this.box = "https://3a7721e6.qb0x.com:30485/jhu/";

};

/**
 * Returns a promise object
 * @param {string} content_types  Array of content types to query
 * @param {array}  data           Data to pass
 */
Elasticsearch.prototype.search = function (content_types, data) {

  data = JSON.stringify(data);

  return $.ajax({
    method: "POST",
    crossDomain: true,
    url: this.box + content_types.join(",") + "/_search",
    data: data
  });

},


module.exports = Elasticsearch;
