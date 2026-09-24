import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bot,
  Briefcase,
  ChevronDown,
  CodeXml,
  Download,
  ExternalLink,
  Gauge,
  GraduationCap,
  Layers,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Menu,
  Plug,
  Search,
  SearchX,
  ShieldCheck,
  Sparkles,
  Target,
  Telescope,
  Workflow,
  X,
  Zap,
} from 'lucide-react'

import projects from './data/projects.json'
import profile from './data/profile.json'

/* ------------------------------------------------------------------ */
/* Constantes d'affichage (aucune donnée de projet ici)               */
/* ------------------------------------------------------------------ */

const STATUS = {
  production: { label: 'En production', dot: 'bg-emerald-400', cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  beta: { label: 'Bêta', dot: 'bg-sky-400', cls: 'border-sky-400/30 bg-sky-400/10 text-sky-300' },
  'en-cours': { label: 'En cours', dot: 'bg-amber-400', cls: 'border-amber-400/30 bg-amber-400/10 text-amber-300' },
  prototype: { label: 'Prototype', dot: 'bg-violet-400', cls: 'border-violet-400/30 bg-violet-400/10 text-violet-300' },
  archive: { label: 'Archivé', dot: 'bg-zinc-500', cls: 'border-zinc-600 bg-zinc-800/60 text-zinc-400' },
}

const PILLAR_ICONS = {
  workflow: Workflow,
  code: CodeXml,
  shield: ShieldCheck,
  telescope: Telescope,
  zap: Zap,
  bot: Bot,
  sparkles: Sparkles,
  gauge: Gauge,
}

const NAV = [
  { href: '#projets', label: 'Projets' },
  { href: '#parcours', label: 'Parcours' },
  { href: '#methode', label: 'Méthode IA' },
]

const ALL = 'Tous'

/* Lucide ne fournit plus les logos de marque : deux SVG minimalistes. */
function GithubIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function LinkedinIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Petits composants                                                  */
/* ------------------------------------------------------------------ */

function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-base leading-relaxed text-zinc-400">{children}</p>}
    </div>
  )
}

function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.prototype
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function Chip({ children, tone = 'neutral', icon: Icon }) {
  const tones = {
    neutral: 'border-zinc-700/80 bg-zinc-800/50 text-zinc-300',
    ai: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
    built: 'border-emerald-400/25 bg-emerald-400/5 text-emerald-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${tones[tone]}`}>
      {Icon && <Icon className="size-3" aria-hidden="true" />}
      {children}
    </span>
  )
}

function LinkButton({ href, children, variant = 'ghost', download, external }) {
  const variants = {
    primary: 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20',
    ghost: 'border border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-zinc-500 hover:text-white',
  }
  return (
    <a
      href={href}
      download={download}
      {...(external && { target: '_blank', rel: 'noreferrer' })}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${variants[variant]}`}
    >
      {children}
    </a>
  )
}

/* ------------------------------------------------------------------ */
/* Navigation                                                         */
/* ------------------------------------------------------------------ */

function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="font-mono text-sm font-medium text-white">
          {profile.name}
          <span className="text-emerald-400">_</span>
        </a>
        <ul className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {NAV.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition hover:text-white">{l.label}</a>
            </li>
          ))}
          {profile.links.github && (
            <li>
              <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="transition hover:text-white">
                <GithubIcon className="size-5" />
              </a>
            </li>
          )}
        </ul>
        <button
          type="button"
          className="rounded-md p-2 text-zinc-300 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>
      {open && (
        <ul className="space-y-1 border-t border-zinc-800 px-4 py-3 md:hidden">
          {NAV.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-zinc-300 hover:bg-zinc-900">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

function Hero({ stats }) {
  const { links } = profile
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Halo décoratif */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-24 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a33_1px,transparent_1px),linear-gradient(to_bottom,#27272a33_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-20 pb-20 sm:px-6 sm:pt-28 sm:pb-24">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {profile.availability && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              {profile.availability}
            </span>
          )}
          {profile.location && (
            <span className="inline-flex items-center gap-1.5 text-zinc-500">
              <MapPin className="size-4" aria-hidden="true" />
              {profile.location}
            </span>
          )}
        </div>

        <h1 className="mt-8 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
          {profile.name}
          <span className="mt-3 block text-2xl font-medium text-zinc-400 sm:text-3xl">
            {profile.role} <span className="text-zinc-600">×</span>{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-violet-300 bg-clip-text text-transparent">IA générative</span>
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-xl font-medium text-zinc-200 sm:text-2xl">{profile.headline}</p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">{profile.pitch}</p>

        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href="#projets" variant="primary">
            Voir mes outils <ArrowUpRight className="size-4" />
          </LinkButton>
          {links.cv ? (
            <LinkButton href={links.cv} download>
              <Download className="size-4" /> Télécharger le CV
            </LinkButton>
          ) : (
            <LinkButton href="#parcours">
              <Briefcase className="size-4" /> Voir le CV
            </LinkButton>
          )}
          {links.github && (
            <LinkButton href={links.github} external>
              <GithubIcon /> GitHub
            </LinkButton>
          )}
          {links.linkedin && (
            <LinkButton href={links.linkedin} external>
              <LinkedinIcon /> LinkedIn
            </LinkButton>
          )}
          {links.email && (
            <LinkButton href={`mailto:${links.email}`}>
              <Mail className="size-4" /> Contact
            </LinkButton>
          )}
        </div>

        <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800">
          {stats.map((s) => (
            <div key={s.label} className="bg-zinc-950/90 px-4 py-5 sm:px-6">
              <dt className="text-xs text-zinc-500 sm:text-sm">{s.label}</dt>
              <dd className="mt-1 font-mono text-2xl font-medium text-white sm:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Hub Outils & Dépôts                                                */
/* ------------------------------------------------------------------ */

function ProjectCard({ project: p, onTag, activeTag }) {
  const hasStack = p.ai?.length > 0 || p.apis?.length > 0
  return (
    <article
      className={`group relative flex flex-col rounded-2xl border p-6 transition hover:border-zinc-600 sm:p-7 ${
        p.featured
          ? 'border-emerald-400/25 bg-gradient-to-b from-emerald-400/[0.06] to-zinc-900/40'
          : 'border-zinc-800 bg-zinc-900/40'
      }`}
    >
      <header>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="font-mono uppercase tracking-wider">{p.category}</span>
          {p.version && <span className="font-mono">· v{p.version}</span>}
          {p.featured && (
            <span className="inline-flex items-center gap-1 text-emerald-300">
              · <Sparkles className="size-3" aria-hidden="true" /> À la une
            </span>
          )}
        </div>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-white">{p.name}</h3>
          <StatusBadge status={p.status} />
        </div>
        {p.tagline && <p className="mt-2 text-sm text-zinc-400">{p.tagline}</p>}
      </header>

      <div className="mt-6 space-y-4 text-sm leading-relaxed">
        <div className="flex gap-3">
          <Target className="mt-0.5 size-4 shrink-0 text-rose-300" aria-hidden="true" />
          <p>
            <span className="font-medium text-zinc-100">Problème. </span>
            <span className="text-zinc-400">{p.problem}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden="true" />
          <p>
            <span className="font-medium text-zinc-100">Idée directrice. </span>
            <span className="text-zinc-400">{p.solution}</span>
          </p>
        </div>
      </div>

      {p.architecture?.length > 0 && (
        <details className="group/arch mt-5 rounded-lg border border-zinc-800 bg-zinc-950/40">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-200 [&::-webkit-details-marker]:hidden">
            <Layers className="size-4 text-sky-300" aria-hidden="true" />
            Choix d'architecture
            <ChevronDown className="ml-auto size-4 text-zinc-500 transition group-open/arch:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="space-y-1.5 px-3 pb-3 text-sm text-zinc-400">
            {p.architecture.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-zinc-500" />
                {a}
              </li>
            ))}
          </ul>
        </details>
      )}

      {hasStack && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">IA & API mobilisées</p>
          <div className="flex flex-wrap gap-1.5">
            {p.ai?.map((m) => (
              <Chip key={m} tone="ai" icon={Sparkles}>{m}</Chip>
            ))}
            {p.apis?.map((a) => (
              <Chip key={a} icon={Plug}>{a}</Chip>
            ))}
          </div>
        </div>
      )}

      {p.builtWith?.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">Conçu avec</span>
          {p.builtWith.map((b) => (
            <Chip key={b} tone="built" icon={Bot}>{b}</Chip>
          ))}
        </div>
      )}

      {p.highlights?.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
          {p.highlights.map((h) => (
            <li key={h} className="flex items-center gap-1.5">
              <Zap className="size-3 text-emerald-400" aria-hidden="true" />
              {h}
            </li>
          ))}
        </ul>
      )}

      {/* mt-auto : aligne le pied de carte en bas, quelle que soit la hauteur du contenu */}
      <footer className="mt-auto pt-6">
        {p.tags?.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTag(t)}
                aria-pressed={activeTag === t}
                className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] transition ${
                  activeTag === t ? 'bg-emerald-400 text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-5">
          {p.repoPrivate ? (
            <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-500">
              <Lock className="size-4" aria-hidden="true" /> Code privé
            </span>
          ) : (
            <a
              href={p.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              <GithubIcon /> Dépôt
            </a>
          )}
          {p.demo && (
            <a
              href={p.demo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-300"
            >
              {p.demoLabel ?? 'Démo'} <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </footer>
    </article>
  )
}

function ProjectsHub() {
  const [category, setCategory] = useState(ALL)
  const [tag, setTag] = useState(null)
  const [aiOnly, setAiOnly] = useState(false)
  const [query, setQuery] = useState('')

  const categories = useMemo(() => [ALL, ...new Set(projects.map((p) => p.category))], [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects
      .filter((p) => category === ALL || p.category === category)
      .filter((p) => !tag || p.tags?.includes(tag))
      .filter((p) => !aiOnly || p.ai?.length > 0)
      .filter((p) => {
        if (!q) return true
        const haystack = [p.name, p.tagline, p.problem, p.solution, ...(p.tags ?? []), ...(p.ai ?? []), ...(p.apis ?? [])]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
  }, [category, tag, aiOnly, query])

  const reset = () => {
    setCategory(ALL)
    setTag(null)
    setAiOnly(false)
    setQuery('')
  }

  const chip = (active) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition ${
      active ? 'border-white bg-white text-zinc-950' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
    }`

  return (
    <section id="projets" className="scroll-mt-16 border-t border-zinc-800/80 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Hub outils & dépôts" title="Des problèmes réels, des outils en ligne.">
          Chaque projet part d'un irritant concret. Pour chacun : le problème, l'idée directrice, l'architecture retenue et les
          modèles ou API mobilisés.
        </SectionHeading>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} className={chip(category === c)}>
                {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAiOnly((v) => !v)}
              aria-pressed={aiOnly}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition ${
                aiOnly ? 'border-violet-300 bg-violet-300 text-zinc-950' : 'border-violet-400/30 text-violet-300 hover:border-violet-400/60'
              }`}
            >
              <Sparkles className="size-3.5" aria-hidden="true" /> IA intégrée
            </button>
          </div>
          <label className="relative block lg:w-72">
            <span className="sr-only">Rechercher un projet</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (ex. Claude, PWA…)"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2 pr-3 pl-9 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
            />
          </label>
        </div>

        {tag && (
          <p className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
            Filtré par <span className="rounded-full bg-emerald-400 px-2.5 py-0.5 font-mono text-xs text-zinc-950">#{tag}</span>
            <button type="button" onClick={() => setTag(null)} className="inline-flex items-center gap-1 text-zinc-500 hover:text-white">
              <X className="size-3.5" /> retirer
            </button>
          </p>
        )}

        {visible.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {visible.map((p) => (
              <ProjectCard key={p.id} project={p} activeTag={tag} onTag={(t) => setTag((cur) => (cur === t ? null : t))} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
            <SearchX className="size-8 text-zinc-600" aria-hidden="true" />
            <p className="mt-3 text-zinc-400">Aucun projet ne correspond à ces filtres.</p>
            <button type="button" onClick={reset} className="mt-4 text-sm text-emerald-400 hover:text-emerald-300">
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* CV augmenté                                                        */
/* ------------------------------------------------------------------ */

function Resume() {
  return (
    <section id="parcours" className="scroll-mt-16 border-t border-zinc-800/80 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="CV augmenté" title="Parcours & compétences">
          L'essentiel de mon expérience, en un coup d'œil.
          {profile.links.cv && (
            <>
              {' '}
              <a href={profile.links.cv} download className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                Télécharger la version PDF <Download className="size-4" />
              </a>
            </>
          )}
        </SectionHeading>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Expériences */}
          <div className="lg:col-span-2">
            <h3 className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Briefcase className="size-4 text-emerald-400" aria-hidden="true" /> Expériences
            </h3>
            <ol className="relative space-y-10 border-l border-zinc-800 pl-6">
              {profile.experience.map((e) => (
                <li key={`${e.title}-${e.period}`} className="relative">
                  <span className="absolute top-1.5 -left-[29px] size-2.5 rounded-full border-2 border-zinc-950 bg-emerald-400" />
                  <p className="font-mono text-xs text-zinc-500">{e.period}</p>
                  <h4 className="mt-1 text-lg font-semibold text-white">{e.title}</h4>
                  <p className="text-sm text-zinc-400">
                    {e.org}
                    {e.location && <span className="text-zinc-600"> · {e.location}</span>}
                  </p>
                  {e.points?.length > 0 && (
                    <ul className="mt-3 space-y-1.5 text-sm text-zinc-400">
                      {e.points.map((pt) => (
                        <li key={pt} className="flex gap-2">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-zinc-600" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Formations + compétences */}
          <div className="space-y-12">
            <div>
              <h3 className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-200">
                <GraduationCap className="size-4 text-emerald-400" aria-hidden="true" /> Formations
              </h3>
              <ul className="space-y-4">
                {profile.education.map((ed) => (
                  <li key={`${ed.title}-${ed.period}`} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                    <p className="font-mono text-xs text-zinc-500">{ed.period}</p>
                    <p className="mt-1 font-medium text-white">{ed.title}</p>
                    <p className="text-sm text-zinc-400">{ed.org}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-6 flex items-center gap-2 text-sm font-medium text-zinc-200">
                <CodeXml className="size-4 text-emerald-400" aria-hidden="true" /> Compétences
              </h3>
              <div className="space-y-5">
                {profile.skills.map((s) => (
                  <div key={s.group}>
                    <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">{s.group}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.items.map((i) => (
                        <Chip key={i}>{i}</Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Méthode de travail assistée par IA                                 */
/* ------------------------------------------------------------------ */

function AiMethod() {
  const { aiMethod } = profile
  return (
    <section id="methode" className="relative scroll-mt-16 overflow-hidden border-t border-zinc-800/80 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-0 -z-10 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Méthode de travail" title="Travailler avec l'IA, concrètement.">
          {aiMethod.intro}
        </SectionHeading>

        <div className="grid gap-4 sm:grid-cols-2">
          {aiMethod.pillars.map((pl) => {
            const Icon = PILLAR_ICONS[pl.icon] ?? Sparkles
            return (
              <div key={pl.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-violet-400/30">
                <span className="inline-flex size-10 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-400/10 text-violet-300">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">{pl.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{pl.text}</p>
              </div>
            )
          })}
        </div>

        {aiMethod.gains?.length > 0 && (
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            {aiMethod.gains.map((g) => (
              <div key={g.label} className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-violet-400/10 to-transparent p-6">
                <dd className="font-mono text-3xl font-medium text-white">{g.value}</dd>
                <dt className="mt-1 text-sm text-zinc-400">{g.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  const { links } = profile
  const items = [
    links.github && { href: links.github, label: 'GitHub', icon: GithubIcon, external: true },
    links.linkedin && { href: links.linkedin, label: 'LinkedIn', icon: LinkedinIcon, external: true },
    links.email && { href: `mailto:${links.email}`, label: 'Email', icon: Mail },
    links.cv && { href: links.cv, label: 'CV', icon: Download, download: true },
  ].filter(Boolean)

  return (
    <footer className="border-t border-zinc-800/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {profile.name} · Construit avec React, Tailwind CSS et l'aide de Claude.
        </p>
        <ul className="flex flex-wrap gap-5">
          {items.map(({ href, label, icon: Icon, external, download }) => (
            <li key={label}>
              <a
                href={href}
                download={download}
                {...(external && { target: '_blank', rel: 'noreferrer' })}
                className="inline-flex items-center gap-1.5 transition hover:text-white"
              >
                <Icon className="size-4" /> {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  // Les chiffres clés sont calculés depuis projects.json : ils restent justes quand on ajoute un projet.
  const stats = useMemo(() => {
    const live = projects.filter((p) => p.status === 'production').length
    const apis = new Set(projects.flatMap((p) => [...(p.ai ?? []), ...(p.apis ?? [])])).size
    return [
      { value: projects.length, label: 'outils publiés' },
      { value: live, label: 'en production' },
      { value: apis, label: 'API & modèles' },
    ]
  }, [])

  return (
    <div className="min-h-screen font-sans">
      <a href="#projets" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-1 focus:text-zinc-950">
        Aller aux projets
      </a>
      <Nav />
      <main>
        <Hero stats={stats} />
        <ProjectsHub />
        <Resume />
        <AiMethod />
      </main>
      <Footer />
    </div>
  )
}
