# Raymundo Olguin — Portfolio

Architectural & Landscape Designer portfolio site. Nine selected projects, thirty-four renders.

**Live site:** [raymundo-olguin.github.io](https://raymundo-olguin.github.io) *(update this once deployed)*

## Features

- Two complete design languages: warm editorial monograph on desktop, dark iOS-native app on mobile
- 34 high-resolution renders across 9 projects
- Justified gallery layout with aspect-aware pairing
- Interactive lightbox, keyboard navigation, scroll-triggered reveals
- No frameworks, no build step — vanilla HTML/CSS/JS
- Works fully offline after first load (fonts are the only external dependency)

## Structure

```
.
├── index.html       Main document
├── styles.css       All styles for both desktop + mobile designs
├── app.js           Interactive behavior (nav, lightbox, justified gallery)
├── images/          34 optimized JPEG renders (2560px max, q90)
├── .nojekyll        Tells GitHub Pages not to process with Jekyll
└── README.md        This file
```

## Deploy to GitHub Pages

1. Create a new repository on GitHub (any name — suggested: `portfolio` or `raymundo-olguin.github.io`)
2. Upload all files in this folder to the repo root
3. In the repo, go to **Settings → Pages**
4. Under **Source**, select `Deploy from a branch` → `main` → `/ (root)` → **Save**
5. Wait ~30 seconds. Your site will be live at `https://<your-username>.github.io/<repo-name>/`

If you name the repo `<your-username>.github.io` it becomes your main site at `https://<your-username>.github.io`.

## Local development

Just open `index.html` in a browser. No server required.

If you want to use a local server (recommended for accurate relative-path behavior):
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Credits

Typography: Fraunces + Archivo (Google Fonts)
Built: 2023
