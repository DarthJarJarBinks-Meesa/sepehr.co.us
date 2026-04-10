---
title: Research
layout: default
description: Academic and laboratory work in medical devices, orthopedics, and functional neurosurgery.
---

<div class="wrap">
  <header class="page-header">
    <h1 class="page-header__title">Research</h1>
    <p class="page-header__lede">
      Serious engineering and science work, explained for both technical and general readers.
      Add or edit entries in <code>docs/_data/research.yml</code> — the layout stays the same.
    </p>
  </header>

  <div class="research-list">
    {% for item in site.data.research %}
      {% include research-entry.html item=item %}
    {% endfor %}
  </div>
</div>
