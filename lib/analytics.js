/* global module: false */
/* global gs: false */
/* global env: false */

module.exports = {

  /**
   * Track an event in Google Analytics.
   * https://developers.google.com/analytics/devguides/collection/analyticsjs/events
   *
   * @param  {object obj Object containing details of the event to track.
   *                     Required keys:  eventCategory, eventAction
   *                     Optionlal keys: eventLabel, eventValue, hitCallback
   * @return null
   */
  trackEvent: function (obj) {

    obj.hitType = "event";

    if (env !== "production") return;

    ga("send", obj);

  },

  /**
   * Track a pageview in Google Analytics.
   * https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
   *
   * @param  {object obj Object containing details of the page to track.
   *                     Optionlal keys: page, title
   * @return null
   */
  trackPageview: function (obj) {

    obj.hitType = "pageview";

    if (env !== "production") return;

    ga("send", obj);

  },

  /**
   * Function that can be used as the 'hitCallback'
   * to send the user to the destination URL after
   * the info has been sent to Google
   * @param {string} href URL
   * @param  {event} e   jQuery event object
   */
  sendTo: function (href, e) {

    var newTab = e.ctrlKey || e.metaKey ? true : false;

    if (newTab) {
      window.open(href);
    } else {
      window.location.href = href;
    }

  }

}
