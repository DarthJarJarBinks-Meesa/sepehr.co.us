# sepehr.co.us

Personal site for **Sepehr Khavari**, live at **[sepehr.co.us](https://sepehr.co.us/)**.

Static site built with [Jekyll](https://jekyllrb.com/), structured for [GitHub Pages](https://pages.github.com/) from the `docs/` folder (deployed via GitHub Actions). The original repo layout took inspiration from [davorg/davecross.co.uk](https://github.com/davorg/davecross.co.uk); this fork uses a custom theme and data-driven pages.

## Local preview

Use **Ruby 3.1+** (e.g. via [rbenv](https://github.com/rbenv/rbenv) or [mise](https://mise.jdx.dev/)).

```bash
bundle install
bundle exec jekyll serve --source docs
```

Open the URL Jekyll prints (usually `http://127.0.0.1:4000`).

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment**: set **Source** to **GitHub Actions**.
3. The workflow in `.github/workflows/jekyll.yml` builds from `docs/` and publishes `_site`.

DNS for **sepehr.co.us** should point at GitHub Pages as documented by GitHub; `docs/CNAME` contains `sepehr.co.us`.

## Where to edit content

| What | Where |
|------|--------|
| Site title, résumé PDF path, production URL | `docs/_config.yml` |
| Name + home headline | `docs/_data/profile.yml` |
| About photo | `docs/_data/about.yml` |
| About copy | `docs/about/index.md` |
| Research entries | `docs/_data/research.yml` |
| Personal projects | `docs/_data/personal_projects.yml` |
| Home feature cards | `docs/_data/highlights.yml` |
| Email & profile links | `docs/_data/site_links.yml` |
| Crossword puzzle | `docs/assets/data/crossword.json` |
| Résumé file | `docs/assets/documents/` (see README there) |

## Security notes

- No API keys in the frontend. The contact form uses a client-side `mailto:` flow with basic sanitization.
