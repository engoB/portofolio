/*
 * Rapport de visites hebdomadaire (GoatCounter → issue GitHub, donc notification par email).
 * Lancé par .github/workflows/stats.yml. Variables :
 *   GOATCOUNTER_TOKEN  secret du dépôt (GoatCounter → Settings → API → New token, droit « read statistics »)
 *   GITHUB_TOKEN, GITHUB_REPOSITORY  fournis par GitHub Actions
 */
import { readFileSync, appendFileSync } from 'node:fs'

const site = JSON.parse(readFileSync(new URL('../src/content/site.json', import.meta.url), 'utf8'))
const code = site.analytics?.goatcounter
const token = process.env.GOATCOUNTER_TOKEN

if (!code || !token) {
  console.log('Mesure d’audience non configurée (site.json → analytics.goatcounter, secret GOATCOUNTER_TOKEN) : rien à faire.')
  process.exit(0)
}

const day = (d) => d.toISOString().slice(0, 10)
const now = new Date()
const end = new Date(now)
const start = new Date(now.getTime() - 7 * 864e5)
const prevStart = new Date(now.getTime() - 14 * 864e5)

async function gc(path, from, to, extra = '') {
  const res = await fetch(`https://${code}.goatcounter.com/api/v0/${path}?start=${day(from)}&end=${day(to)}${extra}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`GoatCounter ${path} : HTTP ${res.status} ${await res.text()}`)
  return res.json()
}

const safe = async (fn, fallback) => {
  try {
    return await fn()
  } catch (e) {
    console.warn(e.message)
    return fallback
  }
}

const total = await safe(async () => (await gc('stats/total', start, end)).total ?? 0, null)
const prev = await safe(async () => (await gc('stats/total', prevStart, start)).total ?? 0, null)
const hits = await safe(async () => (await gc('stats/hits', start, end, '&limit=10')).hits ?? [], [])
const refs = await safe(async () => (await gc('stats/toprefs', start, end, '&limit=8')).stats ?? [], [])
const locs = await safe(async () => (await gc('stats/locations', start, end, '&limit=6')).stats ?? [], [])

const trend = total != null && prev ? ` (${total >= prev ? '+' : ''}${Math.round(((total - prev) / prev) * 100)} % vs semaine précédente)` : ''
const rows = (list, label) =>
  list.length ? list.map((x) => `| ${(x[label] || x.name || x.path || '—').toString().replace(/\|/g, '/')} | ${x.count ?? '—'} |`).join('\n') : '| — | — |'

const body = `**Semaine du ${day(start)} au ${day(end)}**

- Visites : **${total ?? 'indisponible'}**${trend}

### Pages les plus vues
| Page | Visites |
|---|---|
${rows(hits, 'path')}

### D'où viennent les visiteurs
| Source | Visites |
|---|---|
${rows(refs, 'name')}

### Pays
| Pays | Visites |
|---|---|
${rows(locs, 'name')}

Tableau de bord complet : https://${code}.goatcounter.com

_Rapport automatique. Fermez cette issue une fois lue._`

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, body)

const repo = process.env.GITHUB_REPOSITORY
if (repo && process.env.GITHUB_TOKEN) {
  const res = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' },
    body: JSON.stringify({ title: `📊 Visites du ${day(start)} au ${day(end)} : ${total ?? '?'}`, body }),
  })
  console.log(res.ok ? 'Issue de rapport créée.' : `Création de l'issue impossible : ${res.status} ${await res.text()}`)
} else {
  console.log(body)
}
