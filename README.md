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

Hugo automatically generates 480w, 720w, and 1200w variants with proper `srcset`, `width`, `height`, and `loading="lazy"` attributes for optimal performance.

## Theme

Based on [Hugo Bear Blog](https://github.com/janraasch/hugo-bearblog) by [Jan Raasch](https://github.com/janraasch).

## License

- **Code**: [MIT License](LICENSE) - The Hugo theme and site code are licensed under the MIT License.
- **Content**: [CC BY 4.0](LICENSE-CONTENT) - Blog posts and written content are licensed under Creative Commons Attribution 4.0 International.