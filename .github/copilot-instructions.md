# Copilot instructions for sepehr.co.us

## Overview

This repository powers **[sepehr.co.us](https://sepehr.co.us/)**, the personal site of **Sepehr Khavari** (Mechanical Engineering & Neuroscience, Northwestern). It is a **static Jekyll 4** site with a **custom layout** (not Minimal Mistakes). Content and source live under **`docs/`**. Production deploys with **GitHub Actions** (`.github/workflows/jekyll.yml`); the custom domain is set in **`docs/CNAME`**.

## Stack

- **Jekyll** ~> 4.3 (`Gemfile` at repo root)
- **Plugins:** `jekyll-seo-tag`, `jekyll-sitemap`
- **Assets:** `docs/assets/css/main.css`, `docs/assets/js/*.js`
- **Data-driven sections:** `docs/_data/research.yml`, `personal_projects.yml`, `highlights.yml`, `site_links.yml`, etc.

## Layouts & pages

- **Layouts:** `docs/_layouts/default.html`, `home.html`, `about.html`
- **Includes:** `docs/_includes/header.html` (nav + Resume PDF link), `footer.html`, `head.html`, `research-entry.html`, `project-entry.html`
- **Main pages:** `index.md` (home), `about/`, `research/`, `personal-projects/`, `contact/`, `fun-surprise/` (crossword loads `assets/data/crossword.json`)

## Local commands

```bash
bundle install
bundle exec jekyll build --source docs --destination _site
bundle exec jekyll serve --source docs
```

Always use **`--source docs`** (or `cd docs` and run Jekyll there) — the site root is **`docs/`**, not the repository root.

## Configuration

- **`docs/_config.yml`:** `url` (https://sepehr.co.us), `title`, `resume_pdf_path`, `plugins`, excludes
- **`docs/CNAME`:** `sepehr.co.us` for GitHub Pages custom domain

## Legacy / unused

- **`bin/makefeed`:** Perl script from the upstream fork (2020-vision feeds). The `docs/2020-vision/` section was removed; do not assume this script is part of the current workflow.

## Changing content

- Prefer editing **`docs/_data/*.yml`** and Markdown under **`docs/`** rather than changing layout HTML, unless the task requires UI changes.
- Research and personal projects are rendered by Liquid loops over `_data` files and `{% include %}` partials — add rows to YAML to add cards.

## Security

- Do not commit API keys, Formspree IDs, or other secrets. The contact form is **mailto-based** by design.
