/*
 * Legacy compatibility asset for the retired jquery.form URL.
 *
 * Current forms use native JavaScript and do not load this file. The small
 * fallback below prevents errors only when an old cached page still requests
 * the former plugin path. It does not intercept current website forms.
 */
(function legacyAjaxFormCompatibility(window) {
  "use strict";

  var $ = window.jQuery;
  if (!$ || !$.fn) return;

  if (typeof $.fn.ajaxForm !== "function") {
    $.fn.ajaxForm = function ajaxFormCompatibility() {
      return this;
    };
  }

  if (typeof $.fn.ajaxSubmit !== "function") {
    $.fn.ajaxSubmit = function ajaxSubmitCompatibility() {
      return this.each(function submitLegacyForm() {
        if (this && this.tagName === "FORM" && typeof this.submit === "function") {
          HTMLFormElement.prototype.submit.call(this);
        }
      });
    };
  }
}(window));
