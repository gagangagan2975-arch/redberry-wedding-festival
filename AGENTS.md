# AGENTS.md

Static marketing site for REDBERRY (wedding & festival shoot + edit studio). There is no framework and no build step.

## Layout
- `public/index.html` — the single landing page (hero, services, gallery, packages, booking form, footer)
- `public/styles.css` — all styles; the theme lives in CSS variables in `:root` (red/berry/pink on a dark navy background)
- `public/app.js` — smooth scrolling (`data-scroll="<id>"`), package buttons (`data-package`) that pre-select the form's package, gallery tilt, and the canvas 3D particle scene
- `public/thank-you.html` — where the booking form redirects after a successful submission (`action="/thank-you"`)
- `netlify.toml` — sets the publish directory to `public`

## Conventions / decisions
- The booking form uses Netlify Forms as static HTML (`data-netlify="true"`, honeypot `bot-field`). If you rename fields, the next deploy re-registers them. Keep the form in the static HTML so it gets detected.
- The 3D scene is hand-rolled 2D-canvas projection with no WebGL or dependencies, and it respects `prefers-reduced-motion`.
- Gallery tiles are styled placeholders. Swap in real media (served via `/.netlify/images?url=...`) when it's available.
