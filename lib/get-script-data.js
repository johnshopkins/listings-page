var $ = require("../shims/jquery");

module.exports = function (el) {

  var script = el.is("script") ? el : el.find("script");

  if (script.length === 0) return null;

  var data = $.parseJSON(script.html());
  script.remove();

  return data;

};
