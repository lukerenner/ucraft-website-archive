/* Contact form handler. The original form posted to Ucraft's server,
   which is gone. The form now posts to FormSubmit (see the action + hidden
   fields in the page markup), which emails luke@lukerenner.co and redirects
   to /thanks.html — the same setup as the newer lukerenner.co site.
   Ucraft's submit control is an <a> that its bundled JS hijacks for an AJAX
   call to the dead backend, so we detach that and trigger a real POST. */
(function () {
  function init() {
    document.querySelectorAll('form[id^="form-module"]').forEach(function (form) {
      var btn = form.querySelector('.moduleForm-submit');
      if (!btn) return;
      // clone to shed any handlers Ucraft's bundled JS attached to the button
      var clean = btn.cloneNode(true);
      btn.parentNode.replaceChild(clean, btn);

      function submit(e) {
        e.preventDefault();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        // basic required-field validation
        var missing = null;
        ["Name", "Email", "Message"].forEach(function (name) {
          var el = form.querySelector('[name="' + name + '"]');
          if (el && !el.value.trim() && !missing) missing = el;
        });
        if (missing) {
          missing.focus();
          missing.reportValidity && missing.reportValidity();
          return;
        }
        // drop Ucraft's empty reCAPTCHA field so it doesn't clutter the email
        var rc = form.querySelector('[name="g-recaptcha-response"]');
        if (rc) rc.parentNode.removeChild(rc);
        // native submit — bypasses Ucraft's submit-event AJAX entirely
        form.submit();
      }

      clean.addEventListener("click", submit);
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
