/* Contact form handler. The original form posted to Ucraft's server,
   which is gone — instead, "Send" opens the visitor's mail client with
   the message pre-filled. Swap this for a service like Formspree if you
   want true in-page submission. */
(function () {
  function init() {
    document.querySelectorAll('form[id^="form-module"]').forEach(function (form) {
      var btn = form.querySelector('.moduleForm-submit');
      if (!btn) return;
      // clone to shed any handlers Ucraft's bundled JS may have attached
      var clean = btn.cloneNode(true);
      btn.parentNode.replaceChild(clean, btn);

      function send(e) {
        e.preventDefault();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        var val = function (sel) {
          var el = form.querySelector(sel);
          return el ? el.value.trim() : "";
        };
        var name = val('[name="Name"]');
        var email = val('[name="Email"]');
        var msg = val('[name="Message"]');
        var body = msg + "\n\n— " + (name || "Anonymous") + (email ? " <" + email + ">" : "");
        var subject = "Website inquiry" + (name ? " from " + name : "");
        window.location.href =
          "mailto:luke.renner@gmail.com?subject=" +
          encodeURIComponent(subject) +
          "&body=" +
          encodeURIComponent(body);
      }

      clean.addEventListener("click", send);
      form.addEventListener("submit", send, true);
    });
  }
  /* On phones, a few columns carry huge hard-coded top padding as inline
     `!important` styles (a Ucraft alignment hack meant for desktop). CSS
     can't override inline !important, so cap it here and restore the
     original value if the viewport grows back. */
  var mq = window.matchMedia("(max-width: 767px)");
  var watched = [];
  function capElement(el) {
    var current = parseFloat(el.style.paddingTop) || 0;
    if (mq.matches) {
      if (current > 80) {
        el.dataset.polishPt = String(current);
        el.style.setProperty("padding-top", "40px", "important");
      }
    } else if (el.dataset.polishPt && current !== parseFloat(el.dataset.polishPt)) {
      el.style.setProperty("padding-top", el.dataset.polishPt + "px", "important");
    }
  }
  function balancePadding() {
    document.querySelectorAll('.column[style*="padding-top"]').forEach(function (el) {
      capElement(el);
      if (watched.indexOf(el) === -1) {
        watched.push(el);
        // Ucraft's bundled JS rewrites these paddings after load; re-cap
        // whenever the inline style changes (no-op once value is ours).
        new MutationObserver(function () { capElement(el); })
          .observe(el, { attributes: true, attributeFilter: ["style"] });
      }
    });
  }
  function initAll() {
    init();
    balancePadding();
  }
  if (mq.addEventListener) mq.addEventListener("change", balancePadding);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
