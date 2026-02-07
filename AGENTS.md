# Agent Guidelines for hugo-bearblog

Hugo static site theme with a personal blog in `avatsav/`. Theme uses Go templates, content in Markdown with TOML frontmatter. No CSS files (inline styles only), no JavaScript.

## Commands

```bash
# Development
hugo server --source ./avatsav                    # Local server
hugo server --source ./avatsav --buildDrafts      # Include drafts

# Build
hugo --minify --source ./avatsav                  # Production build

# Content
hugo new blog/post-slug.md --source ./avatsav     # New blog post

# Format
npm run format                                     # Format templates
npm run format:check                               # Check formatting
```

**No test suite.** Test manually at http://localhost:1313 after running `hugo server`.

## Code Style

### Formatting
- **Indentation**: 2 spaces (no tabs)
- **Line endings**: LF
- **Charset**: UTF-8
- Always run `npm run format` after editing templates

### Go Templates (`layouts/**/*.html`)
- Use `{{- ` and ` -}}` for whitespace control
- Variables: `{{ $varName := value }}`
- Conditionals: `{{ if }}`...`{{ end }}`
- Partials: `{{- partial "name.html" . -}}`
- Dates: `.Date.Format "2006-01-02"`
- Hugo functions: `relURL`, `absURL`

### Markdown Content
TOML frontmatter with `+++` delimiters:
```toml
+++
title = "Post Title"
date = "2026-02-06"
slug = "post-slug"
description = "SEO description"
tags = ["tag1", "tag2"]
+++
```

### Naming
- Files/CSS: kebab-case (`my-post.md`, `tags-list`)
- Partials: snake_case (`seo_tags.html`, `custom_head.html`)
- Template vars: camelCase (`$isPublished`)

### Structure
- Blog posts: `avatsav/content/blog/`
- Pages: `avatsav/content/`
- Images: `avatsav/static/images/`
- Config: `avatsav/hugo.toml` (TOML format, snake_case params)

## Key Patterns

- Custom head/body: Use `custom_head.html` / `custom_body.html` partials
- Inline styles: Edit `layouts/partials/style.html` for colors/dark mode
- CI: Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/ci.yml`
