# Vijay Roadlines — website

A 5-page site (Home, About, Fleet, Clients, Contact) plus a password-protected
`admin.html` content editor. Pure HTML/CSS/JS — no build step, no server
required, deploys free on any static host.

## Deploy it for free (pick one)

**Netlify (easiest — drag and drop)**
1. Go to https://app.netlify.com/drop
2. Drag the whole `vijay-roadlines` folder onto the page.
3. Netlify gives you a live URL immediately. Add a custom domain later for free under Site settings → Domain management.

**Vercel**
1. Create a free account at https://vercel.com
2. `npm i -g vercel`, then run `vercel` inside this folder and follow the prompts (choose "no build command", output directory = current folder).

**Cloudflare Pages**
1. Go to https://pages.cloudflare.com → Create a project → Upload assets.
2. Upload this folder. No build command needed.

**GitHub Pages**
1. Create a new GitHub repo and push this folder's contents to it.
2. Repo → Settings → Pages → Deploy from branch → `main` / root.
3. Your site is live at `https://<username>.github.io/<repo>`.

Any of these works — none require a credit card for a small site like this.

## How the content editor (`admin.html`) works

This is a static site, so there's no database to log into. Instead:

- All the text on the site (headline, stats, "why choose us" items, fleet
  table, client list, contact info) lives in **`data/content.json`**.
- `admin.html` is a password-gated form that edits that content.
- **Save & Preview** writes your edits to your browser's local storage, so
  you can see them live on the site *in that browser only* — nothing is
  public yet.
- **Download content.json** exports the edited file. Replace
  `data/content.json` in your project with the downloaded one and redeploy
  (re-drag the folder to Netlify, `git push`, etc.) — that's the step that
  makes a change visible to every visitor.

**Default admin password:** `vijay2026`
Change it before you deploy: open `js/admin.js` and edit the
`ADMIN_PASSWORD` constant near the top of the file.

⚠️ Being honest about security: this password check runs entirely in the
browser, so it's a courtesy lock (keeps a casual visitor from finding the
editor), not real authentication. Don't put anything truly sensitive behind
it. If you later want a real multi-user login and a database-backed CMS,
that needs a small backend (e.g. Netlify Identity + a headless CMS, or
Supabase) — happy to help you set that up if you want to go that route.

## The contact form

The Contact page form posts to **FormSubmit** (formsubmit.co), a free
service that forwards submissions straight to
`vroadlinesggn@gmail.com` — no backend or account needed. The very first
submission after deploying will ask you to click a one-time confirmation
link in your inbox to activate it.

## File structure

```
vijay-roadlines/
├── index.html          Home
├── about.html
├── fleet.html           Goods carrier segment
├── clients.html
├── contact.html
├── admin.html           Password-gated content editor
├── css/style.css
├── js/site.js           Loads data/content.json into every page
├── js/admin.js          Admin panel logic
└── data/content.json    All editable site text — single source of truth
```

## Customizing further

- **Logo/photos:** the site currently uses type and color instead of photos.
  Drop image files into a new `img/` folder and reference them in the HTML
  where you'd like a photo (e.g. a hero truck photo, fleet photos).
- **Colors/fonts:** all design tokens are CSS variables at the top of
  `css/style.css` (`--navy-950`, `--amber-500`, etc.) — change them once and
  they apply everywhere.
