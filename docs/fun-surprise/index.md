---
title: Fun Surprise
layout: default
description: A small thank-you for exploring the site — an interactive crossword.
extra_scripts:
  - /assets/js/crossword.js
---

<div class="wrap">
  <header class="page-header">
    <h1 class="page-header__title">Fun surprise</h1>
    <p class="page-header__lede">
      A polished little reward for curious visitors. The puzzle is loaded from
      <code>docs/assets/data/crossword.json</code> (v2: <code>crossword.entries</code> for clues plus
      <code>crossword.grid</code> for the exact layout). See
      <code>docs/assets/data/CROSSWORD_SCHEMA.md</code> for the full format.
    </p>
  </header>

  <div
    id="crossword-root"
    class="crossword-mount"
    data-crossword-url="{{ '/assets/data/crossword.json' | relative_url }}"
    role="region"
    aria-label="Crossword puzzle"
  ></div>
</div>
