# REDFOX Studio – React + Node.js

Converted from the single `redfox-digihub.html` page. The design is unchanged (same CSS); the page is now
React components, and a Node/Express backend serves the content and stores quote requests.

```
client/   React (Vite) frontend
server/   Node.js (Express) backend
```

## Run in development (2 terminals)
Needs Node 18+ and MongoDB (local, or a free MongoDB Atlas URI).
```bash
npm run install:all
cp server/.env.example server/.env      # set MONGODB_URI and JWT_SECRET
npm run dev:server                      # API on http://localhost:5000 (first start copies data/content.json into MongoDB)
npm run create-admin --prefix server    # asks for admin email + password
npm run dev:client                      # site on http://localhost:5173, admin on http://localhost:5173/admin
```

## Run in production (one server)
```bash
npm run build      # builds client/dist
npm start          # Express serves the API, uploads and the built site on :5000
```
Production needs `JWT_SECRET` (32+ chars) and HTTPS (login cookie is `Secure`). Back up MongoDB and `server/uploads/`.

## Admin panel: /admin
Login with email + password (bcrypt hash, httpOnly SameSite=Strict cookie, login rate limit).
- **Services**: add / edit / delete / reorder, image upload, full detail page. Menu, footer and `/services/<slug>` update automatically.
- **Work**: add / edit / delete / reorder, image upload.
- **Work categories**: "Edit categories" on the Work page (add / rename / reorder the filter buttons).
- **FAQ**, **Settings** (phone, email, address, social links, password).
- **Quotes**: search, status filter, pages of 25, internal notes, **Export CSV** (opens in Excel / Google Sheets).
- **Page text**: headings and short texts of every page (empty box = default text).
- **Site content**: numbers, why-us, process steps, checklist, About page (story, quote, team), info sections, page pictures.
- **SEO**: Google title and description for every page, plus an SEO box inside each service. `/sitemap.xml` and `/robots.txt` are generated automatically.
Uploaded images are saved in `server/uploads/` (JPG, PNG, WebP, GIF, max 5 MB).

## API
Public: `GET /api/health`, `GET /api/content`, `POST /api/quotes`.
Admin (cookie login): everything under `/api/admin/*`.

## Pages (React Router)
`/` Home · `/about` About · `/services` Services · `/work` Work · `/process` Process · `/faq` FAQ · `/contact` Contact

## Images
All pictures are in `client/public/images/` (illustrations in SVG, same brand colours).
To use your own real photos: put the photo in that folder (for example `about-hero.jpg`) and change its path in
`server/data/content.json`, only used for the first seed (`images`, `about.team[].image`, `services[].image`). No code change needed.

## What changed from the HTML file
- Quote form now posts to the backend instead of opening the visitor's email app (the form text was updated to match).
- Edit services, FAQ, process, etc. in `server/data/content.json` – no rebuild needed.
- Email notifications are optional: set the `SMTP_*` values in `server/.env`.
- Spam protection: rate limit (10 requests / 15 min / IP), hidden honeypot field, input validation.
