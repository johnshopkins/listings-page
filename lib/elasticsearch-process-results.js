var Backbone  = require("../shims/backbone");


/**
 * Analyze results to only show the most relevant results
 * based items that were deemed relevant based on passed
 * options.
 *
 * @param  array    results             All search results
 * @param  object   options             Options that control how the function works
 * @return array                        Relevant search results
 */
function processResults (results, options) {

  // var defaults = {
  //   percentage: null,   // The percentage of the highest returned score that
  //                       // should be used to designate the lowest score returnable;
  //                       // example .2 for 20%
  //   returnNum: null,       // Number of results to return
  //   exclude: []         // Array of IDs to exclude from returned results
  // };

  options = options || {};

  if (results.length === 0) return results;

  if (options.percentage) {
    var highestScore = results[0].score;
    var lowScore = highestScore * options.percentage;
  }

  var relevant = [];

  _.each(results, function (result) {

    if (options.percentage && result.score < lowScore) return;
    if (options.exclude && _.indexOf(options.exclude, result.ID) > -1) return;

    relevant.push(result);

  });

  return options.returnNum ? relevant.slice(0, options.returnNum) : relevant;

}



function processCollection (collection, options) {

  options = options || {};

  if (collection.length === 0) return;

  if (options.percentage) {
    var highestScore = collection.at(0).get("score");
    var lowScore = highestScore * options.percentage;
  }

  // keep track of models to remove from collection
  var remove = [];

  collection.each(function (model, i) {

    if (options.percentage && model.get("score") < lowScore) remove.push(model);
    if (options.exclude && _.indexOf(options.exclude, model.get("ID")) > -1) remove.push(model);
    if (options.returnNum && i > options.returnNum - 1) remove.push(model);

  });

  collection.remove(remove);

}


module.exports = function (results, options) {

  if (results.models) {
    return processCollection(results, options);
  } else {
    return processResults(results, options);
  }

};
