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
          <strong>Resume:</strong>
          <a href="{{ site.resume_pdf_path | relative_url }}" target="_blank" rel="noopener noreferrer">Open PDF in a new tab</a>
        </li>
      </ul>
    </div>
  </div>
</div>
