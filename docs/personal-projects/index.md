---
title: Personal Projects
layout: default
description: Inventions, builds, software, and initiatives — independent work outside formal research roles.
---

<div class="wrap">
  <header class="page-header">
    <h1 class="page-header__title">Personal projects</h1>
    <p class="page-header__lede">
      A more playful lane for things I’ve built, prototyped, or pushed forward on my own initiative.
    </p>
  </header>

  <div class="projects-list">
    {% for item in site.data.personal_projects %}
      {% include project-entry.html item=item %}
    {% endfor %}
  </div>
</div>
