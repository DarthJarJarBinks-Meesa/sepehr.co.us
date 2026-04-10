/**
 * Contact form — builds a mailto: link client-side (no API keys, no third-party POST).
 * Sanitizes input to reduce injection in mail clients; status uses textContent only.
 */
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("contact-form-status");
  var email = form.getAttribute("data-contact-email") || "";
  var subjectPrefix = form.getAttribute("data-subject-prefix") || "Website message";

  if (!email) {
    if (statusEl) {
      statusEl.textContent = "Contact email is not configured yet (see site_links.yml).";
    }
    form.querySelectorAll("input, textarea, button").forEach(function (el) {
      el.disabled = true;
    });
    return;
  }

  var MAX = { name: 120, email: 254, message: 8000 };

  function stripControl(s) {
    return String(s)
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .trim();
  }

  function truncate(s, n) {
    if (s.length <= n) return s;
    return s.slice(0, n);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (statusEl) statusEl.textContent = "";

    var name = truncate(stripControl(form.elements.namedItem("name").value), MAX.name);
    var from = truncate(stripControl(form.elements.namedItem("email").value), MAX.email);
    var message = truncate(stripControl(form.elements.namedItem("message").value), MAX.message);

    if (!name || !from || !message) {
      if (statusEl) statusEl.textContent = "Please fill in name, email, and message.";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) {
      if (statusEl) statusEl.textContent = "Please enter a valid email address.";
      return;
    }

    var subject = encodeURIComponent(subjectPrefix + " from " + name);
    var body = encodeURIComponent(
      "From: " + name + " <" + from + ">\n\n" + message + "\n"
    );
    var href = "mailto:" + encodeURIComponent(email) + "?subject=" + subject + "&body=" + body;

    window.location.href = href;

    if (statusEl) {
      statusEl.textContent =
        "Your mail app should open with a draft. If nothing happens, email me directly at the address above.";
    }
  });
})();
