/*
 * Prérendu après `vite build` : une page HTML réelle par adresse, avec son titre,
 * sa description et son image de partage (LinkedIn, X, moteurs de recherche).
 * Génère aussi sitemap.xml, robots.txt, feed.xml (RSS), 404.html et CNAME.
 *
 * Le contenu vient de src/content/ : rien à modifier ici pour ajouter un projet ou un billet.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { paths, publicUrl } from '../src/lib/site-url.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const read = (f) => JSON.parse(readFileSync(join(root, 'src/content', f), 'utf8'))
const site = read('site.json')
const projects = read('projects.json').filter((p) => p.visible !== false)
const allPosts = read('posts.json')
const posts = allPosts.filter((p) => p.visible !== false).sort((a, b) => (a.date < b.date ? 1 : -1))

const url = publicUrl(site)
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const fr = (v) => (typeof v === 'string' ? v : v?.fr || v?.en || '')
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/* Image de partage : carte JPEG dédiée (public/og/<id>.jpg) si elle existe,
   sinon l'image fournie si JPEG/PNG (le WebP est mal lu par certains réseaux), sinon og.jpg */
const shareImage = (id, img) => (existsSync(join(root, 'public/og', `${id}.jpg`)) ? `og/${id}.jpg` : /\.(jpe?g|png)$/i.test(img || '') ? img : 'og.jpg')
const abs = (p) => (!p ? `${url}og.jpg` : /^https?:/.test(p) ? p : url + p.replace(/^\//, ''))
const plain = (md = '') =>
  md
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const clip = (s, n = 180) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

const name = site.identity.name
const role = fr(site.identity.role)

function head({ title, description, path, image, type = 'website', noindex, jsonld, published }) {
  const canonical = url + path
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    noindex ? '<meta name="robots" content="noindex" />' : '',
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${esc(name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${abs(image)}" />`,
    '<meta property="og:locale" content="fr_FR" />',
    '<meta property="og:locale:alternate" content="en_GB" />',
    published ? `<meta property="article:published_time" content="${published}" />` : '',
    '<meta name="twitter:card" content="summary_large_image" />',
    posts.length ? `<link rel="alternate" type="application/rss+xml" title="${esc(name)} — Journal" href="${url}feed.xml" />` : '',
    jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '',
  ]
  return tags.filter(Boolean).join('\n    ')
}

/* Contenu HTML minimal pour les robots qui n'exécutent pas JavaScript (remplacé au chargement) */
const links = (items) => `<ul>${items.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul>`

function write(path, meta, body) {
  const html = template
    .replace(/<!--seo:start-->[\s\S]*<!--seo:end-->/, head({ ...meta, path }))
    .replace('<!--seo:content-->', `<main>${body}</main>`)
  const file = path.endsWith('.html') ? join(dist, path) : join(dist, path, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

const person = {
  '@type': 'Person',
  name,
  jobTitle: role,
  url,
  image: abs(site.identity.photo),
  sameAs: [site.links.github, ...(site.links.socials ?? []).map((s) => s.url), site.links.showArtstation ? site.links.artstation : ''].filter(Boolean),
}

/* Accueil */
const homeDesc = fr(site.seo?.description) || fr(site.hero.intro)
write(
  '',
  {
    title: `${name} — ${role}`,
    description: homeDesc,
    image: 'og.jpg',
    jsonld: { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebSite', name, url, inLanguage: ['fr', 'en'] }, person] },
  },
  `<h1>${esc(fr(site.hero.title))} ${esc(fr(site.hero.accent))}</h1><p>${esc(fr(site.hero.intro))}</p>` +
    links(projects.map((p) => [url + paths.project(p.id), `${p.name} — ${fr(p.hook)}`])) +
    links(posts.map((p) => [url + paths.post(p.id), fr(p.title)])),
)

/* Projets */
for (const p of projects) {
  write(
    paths.project(p.id),
    {
      title: `${p.name} — ${fr(p.hook)}`,
      description: clip(fr(p.pitch)),
      image: shareImage(p.id, p.images?.[0]?.src),
      jsonld: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: p.name,
        description: fr(p.pitch),
        url: url + paths.project(p.id),
        author: person,
        ...(p.demo && { sameAs: p.demo }),
      },
    },
    `<h1>${esc(p.name)}</h1><p>${esc(fr(p.hook))}</p><p>${esc(fr(p.pitch))}</p><p>${esc(fr(p.problem))}</p><p>${esc(fr(p.idea))}</p><p>${esc(fr(p.how))}</p>`,
  )
}

/* Journal */
if (posts.length || allPosts.length) {
  write(
    paths.journal,
    { title: `Journal — ${name}`, description: fr(site.journal?.intro) || homeDesc },
    `<h1>Journal</h1>${links(posts.map((p) => [url + paths.post(p.id), fr(p.title)]))}`,
  )
}
for (const p of allPosts) {
  const draft = p.visible === false
  write(
    paths.post(p.id),
    {
      title: `${fr(p.title)} — ${name}`,
      description: clip(fr(p.summary) || plain(fr(p.body))),
      image: shareImage(p.id, p.cover),
      type: 'article',
      noindex: draft,
      published: p.date,
      jsonld: draft
        ? null
        : {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: fr(p.title),
            description: fr(p.summary),
            datePublished: p.date,
            image: abs(shareImage(p.id, p.cover)),
            url: url + paths.post(p.id),
            author: person,
          },
    },
    `<article><h1>${esc(fr(p.title))}</h1><p>${esc(fr(p.summary))}</p><p>${esc(plain(fr(p.body)))}</p></article>`,
  )
}

/* Mentions légales + 404 */
write(paths.legal, { title: `${fr(site.legal?.title) || 'Mentions légales'} — ${name}`, description: `${fr(site.legal?.title)} — ${name}` }, `<h1>${esc(fr(site.legal?.title))}</h1>`)
write('404.html', { title: `Page introuvable — ${name}`, description: homeDesc, noindex: true }, '<h1>404</h1>')

/* sitemap.xml */
const today = new Date().toISOString().slice(0, 10)
const entries = [
  [url, today],
  ...projects.map((p) => [url + paths.project(p.id), today]),
  ...(posts.length ? [[url + paths.journal, posts[0].date]] : []),
  ...posts.map((p) => [url + paths.post(p.id), p.date]),
  [url + paths.legal, today],
]
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(([loc, d]) => `  <url><loc>${loc}</loc><lastmod>${d}</lastmod></url>`).join('\n')}\n</urlset>\n`,
)

/* robots.txt (fonctionne dès qu'un domaine est à la racine ; sur github.io il est indicatif) */
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${url}sitemap.xml\n`)

/* feed.xml — flux RSS du journal */
const rssItems = posts
  .map(
    (p) => `    <item>
      <title>${esc(fr(p.title))}</title>
      <link>${url + paths.post(p.id)}</link>
      <guid>${url + paths.post(p.id)}</guid>
      <pubDate>${new Date(`${p.date}T09:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(fr(p.summary))}</description>
    </item>`,
  )
  .join('\n')
writeFileSync(
  join(dist, 'feed.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(name)} — Journal</title>
    <link>${url}</link>
    <description>${esc(homeDesc)}</description>
    <language>fr</language>
${rssItems}
  </channel>
</rss>
`,
)

/* Domaine personnalisé */
if (site.domain) writeFileSync(join(dist, 'CNAME'), `${site.domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}\n`)

console.log(`Prérendu : ${2 + projects.length + allPosts.length + (posts.length || allPosts.length ? 1 : 0) + 1} pages, sitemap (${entries.length} adresses), RSS (${posts.length} billets) → ${url}`)
