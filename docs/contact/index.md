---
title: Contact
layout: default
description: Get in touch about research, engineering, entrepreneurship, or collaboration.
extra_scripts:
  - /assets/js/contact-form.js
---

<div class="wrap">
  <header class="page-header">
    <h1 class="page-header__title">Contact</h1>
    <p class="page-header__lede">
      I’d love to connect about research, engineering, entrepreneurship, or collaboration.
      Replace the placeholder links in <code>docs/_data/site_links.yml</code> when you’re ready.
    </p>
  </header>

  <div class="contact-grid">
    <div>
      <h2 class="section__title" style="margin-top:0;font-size:1.25rem;">Direct links</h2>
      <ul class="contact-links">
        <li>
          <strong>Email:</strong>
          {% assign em = site.data.site_links.email %}
          {% if em != blank %}
            <a href="mailto:{{ em }}">{{ site.data.site_links.email_display | default: em }}</a>
          {% else %}
            <span>PLACEHOLDER — set <code>email</code> in <code>site_links.yml</code></span>
          {% endif %}
        </li>
        <li>
          <strong>LinkedIn:</strong>
          {% if site.data.site_links.linkedin != blank %}
            <a href="{{ site.data.site_links.linkedin }}" target="_blank" rel="noopener noreferrer">Profile</a>
          {% else %}
            <span>PLACEHOLDER</span>
          {% endif %}
        </li>
        <li>
          <strong>GitHub:</strong>
          {% if site.data.site_links.github != blank %}
            <a href="{{ site.data.site_links.github }}" target="_blank" rel="noopener noreferrer">Repositories</a>
          {% else %}
            <span>PLACEHOLDER</span>
          {% endif %}
        </li>
        <li>
          <strong>Google Scholar:</strong>
          {% if site.data.site_links.google_scholar != blank %}
            <a href="{{ site.data.site_links.google_scholar }}" target="_blank" rel="noopener noreferrer">Publications</a>
          {% else %}
            <span>PLACEHOLDER (optional)</span>
          {% endif %}
        </li>
        {% if site.data.site_links.portfolio != blank %}
        <li>
          <strong>Portfolio:</strong>
          <a href="{{ site.data.site_links.portfolio }}" target="_blank" rel="noopener noreferrer">External portfolio</a>
        </li>
        {% endif %}
      </ul>
      <p class="section__lede" style="margin-top:1.25rem;">
        <strong>Resume:</strong>
        <a href="{{ site.resume_pdf_path | relative_url }}" target="_blank" rel="noopener noreferrer">Open PDF in a new tab</a>
        (replace the file named in <code>_config.yml</code> → <code>resume_pdf_path</code>).
      </p>
    </div>

    <div>
      <h2 class="section__title" style="margin-top:0;font-size:1.25rem;">Send a message</h2>
      <p class="section__lede" style="margin-bottom:1rem;">
        This form never posts to a third party and does not embed API keys. It opens your email client with a
        pre-filled message (you can swap to a secure server-side handler later if you prefer).
      </p>
      <form
        id="contact-form"
        class="contact-form"
        novalidate
        data-contact-email="{{ site.data.site_links.email }}"
        data-subject-prefix="{{ site.data.site_links.email_subject_prefix | default: 'Website message' | xml_escape }}"
      >
        <div>
          <label for="contact-name">Name</label>
          <input id="contact-name" name="name" type="text" autocomplete="name" required maxlength="120">
        </div>
        <div>
          <label for="contact-email">Your email</label>
          <input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="254">
        </div>
        <div>
          <label for="contact-message">Message</label>
          <textarea id="contact-message" name="message" required maxlength="8000"></textarea>
        </div>
        <button type="submit" class="btn btn--primary contact-form__submit">Compose email</button>
        <p id="contact-form-status" class="form-status" aria-live="polite"></p>
      </form>
    </div>
  </div>
</div>
