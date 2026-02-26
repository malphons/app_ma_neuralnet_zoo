# Neural Network Zoo - Architecture Template

This is a template for creating a new architecture in the Neural Network Zoo.

## Quick Start

1. Copy this entire `template/` directory to a new repo named `nn-zoo-{your-architecture}`
2. Edit `manifest.json` with your architecture's metadata
3. Replace `thumbnail.svg` with a custom diagram (keep the `0 0 400 250` viewBox)
4. Customize `index.html` with your architecture content
5. Build the D3 visualization in `js/diagram.js`
6. Push to GitHub and enable GitHub Pages (from `main` branch)
7. Add an entry to `registry.json` in the hub repo (`app_ma_neuralnet_zoo`)

## File Structure

```
nn-zoo-{name}/
  index.html          # Deep-dive page
  manifest.json       # Metadata (fetched by hub at runtime)
  thumbnail.svg       # Gallery card preview (400x250)
  css/architecture.css # Page styles
  js/diagram.js       # D3.js interactive visualization
  README.md           # This file
```

## Manifest Schema

See `manifest.json` for all fields. Required fields:
- `id` - unique identifier (lowercase, hyphens)
- `name` - display name
- `short_description` - one-liner for the gallery card
- `category` - one of: foundational, convolutional, recurrent, attention, generative, autoencoder, regularization
- `tags` - array of searchable tags
- `year_introduced` - year the architecture was published
- `complexity` - one of: beginner, intermediate, advanced

## Thumbnail Conventions

- ViewBox: `0 0 400 250`
- Use CSS classes: `.nn-node` (circles/rects), `.nn-edge` (lines/paths), `.nn-layer` (groups)
- Use `currentColor` for colors (the hub theme will style them)
- Keep under 10KB
- The hub animates `.nn-node` and `.nn-edge` on card hover

## Theme

The page imports the shared theme from the hub:
```html
<link rel="stylesheet" href="https://malphons.github.io/app_ma_neuralnet_zoo/css/zoo.css">
```

For local development, you can copy `zoo.css` or point to a local path.
