# avatsav.dev / avatsav.github.io

Personal blog built with [Hugo](https://gohugo.io/).

## Local development

```bash
hugo server --source ./avatsav
```

### New blog post

```bash
hugo new blog/my-new-post.md --source ./avatsav
```

### New page

```bash
hugo new my-new-page.md --source ./avatsav
```

## Images

Images are processed through Hugo's asset pipeline for responsive delivery. Place images in `avatsav/assets/images/` (not `static/`).

Use the `figure` shortcode in content files:

```markdown
{{< figure src="images/my-image.webp" alt="Description" caption="Optional caption" >}}
```

For above-the-fold images (like hero images), add `priority="high"` to use `fetchpriority="high"` instead of lazy loading:

```markdown
{{< figure src="images/hero.webp" alt="Description" caption="Optional caption" priority="high" >}}
```

Hugo automatically generates 720w, 900w, 1200w, and 1440w variants with proper `srcset`, `width`, `height`, and `loading="lazy"` attributes for optimal performance.

## OG Images

Each blog post gets a unique gradient OG image derived from its slug. Images are committed to `avatsav/static/og/` and served as static files — no generation happens in CI.

Generate images for new posts:

```bash
npm run generate:og
```

This skips posts that already have an image. To regenerate a specific post's image, delete its PNG from `avatsav/static/og/` and re-run.

## Theme

Based on [Hugo Bear Blog](https://github.com/janraasch/hugo-bearblog) by [Jan Raasch](https://github.com/janraasch).

## License

- **Code**: [MIT License](LICENSE) - The Hugo theme and site code are licensed under the MIT License.
- **Content**: [CC BY 4.0](LICENSE-CONTENT) - Blog posts and written content are licensed under Creative Commons Attribution 4.0 International.