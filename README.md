# farhanmullick.com

Personal portfolio, served as a static site from GitHub Pages (`gh-pages` branch).

## Build

```bash
npm install
cp .env.example .env   # then fill in your values
npm run build          # writes assets/dist/bundle.js + bundle.css
npm run dev            # same, but rebuilds on save
```

`assets/dist/` **must be committed** — GitHub Pages serves those files as-is and
does not run a build step. Rebuild and commit whenever anything in `src/` or `.env`
changes.

## Configuration

Values come from `.env` and are split in two by `webpack.config.js`:

| Where it goes | Keys | Notes |
| --- | --- | --- |
| Compiled into the browser bundle | `TURNSTILE_SITEKEY`, `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `CONTACT_ENDPOINT` | Public by design — a Turnstile sitekey and an EmailJS public key are meant to be readable in page source. |
| Never bundled | `ELASTIC_EMAIL_API_KEY`, `ELASTIC_FROM_EMAIL`, `ELASTIC_TO_EMAIL`, `ELASTIC_CONTACT_LIST`, `TURNSTILE_SECRET_KEY`, `PORT` | Read at runtime by `server/index.js`. |

The build **fails** if a server-only key is ever moved into the public list.

Values in `.env` must be bare — no surrounding quotes and no trailing semicolons.
`EMAILJS_PUBLIC_KEY="abc";` gets read literally, quotes and all.

## Contact form

Two modes, chosen by whether `CONTACT_ENDPOINT` is set:

- **Blank (default)** — the browser sends through EmailJS. No server needed, works
  on GitHub Pages as-is.
- **Set to a URL** — the browser POSTs to `server/index.js`, which verifies the
  Turnstile token and sends through Elastic Email.

The second mode exists because `ELASTIC_EMAIL_API_KEY` can send mail on your
behalf, so it can never ship in client JavaScript. GitHub Pages only serves static
files, so `server/index.js` has to be hosted somewhere that runs Node (Render,
Railway, Fly, a VPS) and `CONTACT_ENDPOINT` pointed at its public URL. Add that
origin to `ALLOWED_ORIGINS` in `server/index.js` too.

```bash
npm run serve   # runs the contact endpoint on $PORT
```

## Front-end

No jQuery. `src/js/` holds small vanilla modules that replace what the theme used
to pull in:

| Module | Replaces |
| --- | --- |
| `smooth-scroll.js` | `jquery.scrolly` |
| `header.js` | `jquery.scrollex` + `breakpoints.js` (now `matchMedia`) |
| `section-bg.js` | `jquery.scrollex` (now `IntersectionObserver`) |
| `lightbox.js` | `magnific-popup` (plugin + two stylesheets) |
| `contact-form.js` | the inline script that used to live in `index.html` |
| `preload.js` | the `is-preload` handling in `main.js` |

`assets/css/main.css` is still the compiled HTML5 UP theme and is untouched; edit
`assets/sass/` if you need to change it.
