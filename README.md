# Siddhartha — Portfolio

Light editorial portfolio of Peruri Jai Sai Siddhartha, built with Next.js 14 (App Router), React 18 and TypeScript. Smooth scrolling comes from Lenis. There is no WebGL and no client-side state library.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Hero, featured work, approach, skills, contact call |
| `/work` | All projects, filterable by discipline (`?tag=Games`) |
| `/work/[slug]` | Case study for one project |
| `/about` | Bio, education, highlights, skills |
| `/contact` | Builds an email in the visitor's own mail app. No backend. |
| `/privacy-policy` | Plain-language policy that matches what the site does |

Also included: `sitemap.xml`, `robots.txt`, a 404 page and an error page.

## Edit the content

- `content/projects.ts` holds every project. Add one object to `PROJECTS` and its page, filter chips and sitemap entry appear. Set `featured: true` to show it on the home page.
- Screenshots go in `public/images/projects/`. List them in the project's `images` array with a real description in `alt`.
- `content/site.ts` holds name, contact details, education and skills.
- `content/legal.ts` holds the privacy policy text. Update it if the site starts using analytics, cookies or forms.
- Colours and type live in `app/globals.css` under `:root`.
