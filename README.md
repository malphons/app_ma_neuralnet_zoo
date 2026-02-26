# Neural Network Zoo

An interactive visual gallery of common neural network architectures, built with GitHub Pages.

**Live site:** [malphons.github.io/app_ma_neuralnet_zoo](https://malphons.github.io/app_ma_neuralnet_zoo/)

## Architecture

This project uses a **hub-and-spoke** pattern:

- **Hub** (this repo) — the searchable gallery page
- **Spokes** (separate repos) — one per neural network architecture, each with its own GitHub Pages deployment

The hub discovers spokes at runtime by fetching their `manifest.json` files. No build step — pure HTML/CSS/JS served directly by GitHub Pages.

### Adding a New Architecture

1. Copy `template/` to a new repo named `nn-zoo-{architecture}`
2. Customize `manifest.json`, `thumbnail.svg`, `index.html`, and the D3 visualization
3. Push to GitHub, enable GitHub Pages
4. Add one entry to `data/registry.json` in this repo

See [`template/README.md`](template/README.md) for detailed instructions.

## Tech Stack

| Component | Technology |
|---|---|
| Hub gallery | CSS Grid, vanilla JS |
| Card thumbnails | Inline SVG + CSS animations |
| Search/filter | Vanilla JS (client-side) |
| Deep-dive diagrams | D3.js v7 (CDN) |
| Equations | KaTeX (CDN) |
| Theme | Dark/light toggle, CSS custom properties |

## Phase 1 Architectures

| Architecture | Category | Repo |
|---|---|---|
| Perceptron / MLP | Foundational | `nn-zoo-perceptron` |
| CNN | Convolutional | `nn-zoo-cnn` |
| RNN | Recurrent | `nn-zoo-rnn` |
| LSTM | Recurrent | `nn-zoo-lstm` |
| Autoencoder | Autoencoder | `nn-zoo-autoencoder` |
| GAN | Generative | `nn-zoo-gan` |
| Transformer | Attention | `nn-zoo-transformer` |
| ResNet | Convolutional | `nn-zoo-resnet` |

## Local Development

```bash
# Serve with any static file server
python3 -m http.server 8080
# Open http://localhost:8080
```

## Project Structure

```
app_ma_neuralnet_zoo/
  index.html              # Gallery page
  css/                    # Theme, cards, search styles
  js/                     # Registry, gallery, search, app modules
  data/
    registry.json         # Master list of architecture repos
    fallback-cache.json   # Cached manifests for offline/fast load
  assets/                 # Logo, icons
  template/               # Starter template for new architecture repos
  nn-zoo-perceptron/      # First spoke (Perceptron/MLP) — ready to split into own repo
```
