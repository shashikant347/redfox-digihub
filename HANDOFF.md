# REDFOX project: handoff notes (kahan tak hua, kya baaki hai)

> **STATUS: CODE COMPLETE.** Backend + public site + admin UI (Page text, Site content, SEO, work categories, quotes search/CSV/notes, service SEO) sab bana hai. Admin screens ko mock API ke saath jsdom me test kiya gaya (6 tests pass). **Baaki: real MongoDB ke saath run-test (section 4).**

Ye file kisi bhi dusre AI/developer ko dene ke liye hai taaki wo kaam wahin se aage badha sake.
Project: `redfox-digihub/` (React + Vite client, Node/Express server, **MongoDB**). User ki bhasha: Hinglish.

## 1. Kya pehle se tha (v13 zip)
- React site (Home, About, Services, Service detail, Work, Process, FAQ, Contact).
- Express server: `GET /api/content` (data `server/data/content.json` se), `POST /api/quotes`.
- Admin/DB nahi tha.

## 2. Phase 1: DONE (v14 zip me bhi hai)
- MongoDB (mongoose). Models: `server/src/models/index.js` (Admin, Service, WorkItem, Setting, Quote).
- Pehli baar server start par `content.json` MongoDB me seed hota hai (`seedIfEmpty` in `services/contentStore.js`).
  `GET /api/content` ka JSON shape same rakha gaya hai (frontend ko tootne se bachane ke liye).
- Admin login: email+password (bcryptjs), JWT httpOnly SameSite=Strict cookie `rf_admin`, login rate limit.
  `npm run create-admin --prefix server` se admin banta hai. Code: `middleware/adminAuth.js`, `routes/admin.js`.
- Admin API `/api/admin/*` (sab login ke peeche): services CRUD+reorder, work CRUD+reorder, faq, brand (phone/email/address/social), quotes (list/status/delete), password change, stats, image upload (`/upload`, multer, `server/uploads/`, SVG blocked, 5MB).
- Admin UI `/admin` (lazy loaded): `client/src/admin/` (AdminApp, api.js, ui.jsx, admin.css, pages/Login, Dashboard, Services, Work, Faq, Quotes, Settings).
- Work tiles par image support (`Work.jsx`, `has-img` CSS in `app.css`). `/uploads` Vite proxy me add.

## 3. Phase 1.5 (user ne maanga): 3 cheezein
User ne ye 3 chuni: (A) baaki site content edit, (B) work categories + har page ka SEO, (C) quotes me search/CSV/notes.

### SERVER side: DONE
- `server/src/services/pageDefaults.js`: `PAGE_SCHEMA` (editable page text with defaults), `buildPages`, `SEO_PAGES`, `buildSeo`.
- `server/src/services/seo.js`: `resolveMeta`, `renderIndex` (index.html me title/description/og/canonical/noindex inject), `buildSitemap`.
- `server/src/index.js`: `/robots.txt`, `/sitemap.xml`, SPA catch-all ab per-URL meta inject karta hai (`/admin` = noindex).
- `contentStore.js`: `getContent()` ab `pages` aur `seo` bhi deta hai; service public object me `seoTitle`, `seoDescription`.
- Models: Service me `seoTitle`, `seoDescription`; Quote me `notes`.
- `routes/admin.js` naye endpoints:
  - `PUT /work/categories` body `{items:[{key?,label}]}` (key existing ho to rakhi jaati hai, naya label to slug banta hai; category me work items ho to delete block).
  - `GET/PUT /pages` -> `GET` returns `{schema:[{group,fields:[{path,label,def,area,max}]}], values:{ 'home.chip': '...' }}`; `PUT` body `{values:{path:text}}` (empty = default use).
  - `GET/PUT /seo` -> `GET` returns `{pages:SEO_PAGES, value:{siteName,pages:{key:{title,description}}}}`; `PUT` body `{siteName, pages:{key:{title,description}}}`.
  - `GET/PUT /content/:section` sections: `stats, why, process, checklist, about, extra, images`. `PUT` body `{value: ...}`. GET returns `{value}`.
    - stats `[{value,label}]`, why/process `[{title,text}]` (why ka `n` server banata hai), checklist `[string]`,
      about `{title,lead,story:[string],quote,team:[{role,text,image}]}`,
      extra `{mission,values,industries,included,approach,needFromYou,afterSend}` each `{tag,title,lead?,items}`
      (items = `[{title,text}]` for mission/values/included/approach/afterSend; `[string]` for industries/needFromYou),
      images `{aboutHero,aboutStory,process,contact}` each `{src,alt}`.
  - Quotes: `GET /quotes?status=&q=&page=` -> `{items,total,page,pages}` (25 per page); `GET /quotes/export.csv?status=&q=`; `PATCH /quotes/:id` body `{status?, notes?}`.
- Syntax check ho chuka (`node --check`). **Kuch run nahi hua** (sandbox me internet/MongoDB nahi tha).

### CLIENT public site: DONE
- `hooks/useSeo.js` (purana `usePageTitle.js` hata diya). Sab pages `useSeo(content, key)` use karte hain; ServiceDetail `useSeo(content,'services',s)`.
- Home/Hero/Work/Why/Band/CtaBand, Services/Work/Process/FAQ/Contact/About pages ab `content.pages.*` se text lete hain.
- JSX syntax check tsc se ho chuka.

### CLIENT admin UI: **DONE** (neeche ki list purani hai, ab ye sab bana hua hai)
1. `client/src/admin/api.js` me add karo: `getPages/savePages`, `getSeo/saveSeo`, `getContent(section)/saveContent(section,value)`, `saveWorkCategories(items)`, quotes list me query string + page, `patch('quotes',id,{notes})`.
2. Naye pages (`client/src/admin/pages/`):
   - `PageText.jsx`: `GET /pages` ka schema generic render kare (group -> fields; placeholder = `def`; textarea jab `area`), Save.
   - `SiteContent.jsx`: tabs: Numbers(stats), Why, Process, Checklist, About (title, lead, story paragraphs, quote, team with ImageField), Info sections (`extra`, 7 blocks), Page images (4 images + alt). Reuse `ui.jsx`: `Field, Input, ImageField, ListEditor, StringList, PairList, Notice`.
   - `Seo.jsx`: siteName + har page ke liye title/description (char counter: title ~60, description ~160, placeholder = default).
3. `pages/Work.jsx`: "Categories" panel (ListEditor of `{key,label}`; existing key read-only dikhao), save -> `PUT /work/categories`, phir list reload.
4. `pages/Quotes.jsx`: search box (debounce ~300ms), status filter, pagination (prev/next using `page,pages,total`), "Export CSV" link (`/api/admin/quotes/export.csv?status=..&q=..`), details row me internal notes textarea + Save (`PATCH notes`).
5. `pages/Services.jsx` form: "SEO" section (`seoTitle`, `seoDescription`) add karo; BLANK object me bhi.
6. `AdminApp.jsx`: sidebar links + routes: `/admin/page-text`, `/admin/content`, `/admin/seo`.
7. README update (naye features), phir final zip.

## 4. Test checklist (jab internet + MongoDB ho)
```bash
npm run install:all
cp server/.env.example server/.env   # MONGODB_URI, JWT_SECRET
npm run dev:server
npm run create-admin --prefix server
npm run dev:client                   # /admin
```
Check: login, service add (menu/footer me aaye), work image upload, page text badalna (Home hero), SEO title badalna (view-source production build par), category add/delete block, quote search + CSV open in Excel, fresh DB par seed.
Production check: `npm run build && npm start`, `view-source:/services/web-design` me title/description inject hua ya nahi, `/sitemap.xml`, `/robots.txt`.

## 5. Dhyan rakhne wali baatein
- Cookie production me `Secure` hai: HTTPS chahiye ya `COOKIE_SECURE=false`.
- `JWT_SECRET` production me 32+ chars zaroori.
- Service ka slug banne ke baad badalta nahi (links na tootein).
- Sandbox ke tool output me backslashes double dikhte hain (JSON escaping); files me sahi hain. `admin.js` ke `escapeRe` aur `csvCell` run karke verify kiye gaye.
- JSX syntax check command (client/src se): `tsc --noEmit --jsx preserve --allowJs --noResolve --skipLibCheck --target es2022 --module esnext <file> | grep "error TS1"`.
- Phase 2 (abhi nahi): client portal with email OTP login. User ne ise abhi nahi chuna.
