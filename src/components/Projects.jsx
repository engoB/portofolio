import { useMemo, useState } from 'react'
import { ArrowUpRight, Bot, ChevronDown, Layers, Lock, Plug, Search, SearchX, Sparkles, X, Zap } from 'lucide-react'
import projects from '../data/projects.json'
import { BrowserFrame, Chip, GithubIcon, PhoneFrame, Reveal, SectionHeading, StatusBadge, asset, trackPointer } from './ui.jsx'

const ALL = 'Tous'
const hostOf = (url) => {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/* ------------------------------------------------------------------ */
/* Visuel : capture dans un cadre navigateur ou téléphone             */
/* ------------------------------------------------------------------ */

function ProjectVisual({ p, large }) {
  const accent = p.accent ?? '#7dd3fc'
  const src = asset(p.image)
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-zinc-950 ring-1 ring-white/10 ${large ? 'h-[380px] sm:h-[480px]' : 'h-64 sm:h-72'}`}>
      <div aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(90% 75% at 50% 110%, ${accent}40, transparent 70%)` }} />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      {!src ? (
        <div className="absolute inset-0 grid place-items-center font-serif text-7xl text-white/20 italic">{p.name.charAt(0)}</div>
      ) : p.imageKind === 'mobile' ? (
        <PhoneFrame
          src={src}
          alt={`Capture de ${p.name}`}
          className={`absolute left-1/2 -translate-x-1/2 transition-transform duration-700 ease-out group-hover:-translate-y-2 ${
            large ? 'top-10 w-[210px] sm:w-[240px]' : 'top-8 w-[150px]'
          }`}
        />
      ) : (
        <div
          className={`absolute transition-transform duration-700 ease-out group-hover:-translate-y-2 ${
            large ? 'top-12 left-6 w-[125%] sm:top-14 sm:left-10 sm:w-[118%]' : 'top-8 left-6 w-[125%]'
          }`}
        >
          <BrowserFrame src={src} alt={`Capture de ${p.name}`} url={p.demo ? hostOf(p.demo) : undefined} />
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Blocs de contenu partagés                                          */
/* ------------------------------------------------------------------ */

function Meta({ p }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] tracking-wider text-zinc-500 uppercase">
      <span style={{ color: p.accent }}>{p.category}</span>
      {p.version && <span>· v{p.version}</span>}
      {p.year && <span>· {p.year}</span>}
    </div>
  )
}

function ProblemSolution({ p }) {
  return (
    <dl className="space-y-4 text-sm leading-relaxed">
      <div>
        <dt className="mb-1 font-mono text-[10px] tracking-[0.18em] text-rose-300/80 uppercase">Problème</dt>
        <dd className="text-zinc-400">{p.problem}</dd>
      </div>
      <div>
        <dt className="mb-1 font-mono text-[10px] tracking-[0.18em] text-amber-200/80 uppercase">Idée directrice</dt>
        <dd className="text-zinc-300">{p.solution}</dd>
      </div>
    </dl>
  )
}

function Architecture({ items }) {
  if (!items?.length) return null
  return (
    <details className="group/arch rounded-xl bg-white/[0.02] ring-1 ring-white/[0.07] ring-inset">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm text-zinc-200 [&::-webkit-details-marker]:hidden">
        <Layers className="size-4 text-sky-300" aria-hidden="true" />
        Choix d'architecture
        <ChevronDown className="ml-auto size-4 text-zinc-500 transition-transform group-open/arch:rotate-180" aria-hidden="true" />
      </summary>
      <ul className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-zinc-400">
        {items.map((a) => (
          <li key={a} className="flex gap-2.5">
            <span className="mt-[9px] size-1 shrink-0 rounded-full bg-sky-300/60" />
            {a}
          </li>
        ))}
      </ul>
    </details>
  )
}

function Stack({ p }) {
  const hasStack = p.ai?.length > 0 || p.apis?.length > 0
  return (
    <div className="space-y-3">
      {hasStack && (
        <div>
          <p className="mb-2 font-mono text-[10px] tracking-[0.18em] text-zinc-500 uppercase">IA & API mobilisées</p>
          <div className="flex flex-wrap gap-1.5">
            {p.ai?.map((m) => (
              <Chip key={m} tone="ai" icon={Sparkles}>
                {m}
              </Chip>
            ))}
            {p.apis?.map((a) => (
              <Chip key={a} icon={Plug}>
                {a}
              </Chip>
            ))}
          </div>
        </div>
      )}
      {p.builtWith?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-mono text-[10px] tracking-[0.18em] text-zinc-500 uppercase">Conçu avec</span>
          {p.builtWith.map((b) => (
            <Chip key={b} tone="built" icon={Bot}>
              {b}
            </Chip>
          ))}
        </div>
      )}
    </div>
  )
}

function Highlights({ items }) {
  if (!items?.length) return null
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-zinc-400">
      {items.map((h) => (
        <li key={h} className="flex items-center gap-1.5">
          <Zap className="size-3 text-emerald-300" aria-hidden="true" />
          {h}
        </li>
      ))}
    </ul>
  )
}

function Tags({ p, activeTag, onTag }) {
  if (!p.tags?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {p.tags.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onTag(t)}
          aria-pressed={activeTag === t}
          className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] transition ${
            activeTag === t ? 'bg-white text-zinc-950' : 'bg-white/[0.04] text-zinc-500 hover:bg-white/10 hover:text-zinc-200'
          }`}
        >
          #{t}
        </button>
      ))}
    </div>
  )
}

function Actions({ p }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {p.demo && (
        <a
          href={p.demo}
          target="_blank"
          rel="noreferrer"
          className="group/btn inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          {p.demoLabel ?? 'Démo'}
          <ArrowUpRight className="size-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" aria-hidden="true" />
        </a>
      )}
      {p.repoPrivate ? (
        <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-zinc-500 ring-1 ring-white/10 ring-inset">
          <Lock className="size-3.5" aria-hidden="true" /> Code privé
        </span>
      ) : (
        <a
          href={p.repo}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-zinc-200 ring-1 ring-white/15 transition ring-inset hover:bg-white/5 hover:text-white"
        >
          <GithubIcon className="size-3.5" /> Code source
        </a>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Cartes                                                             */
/* ------------------------------------------------------------------ */

function CaseStudy({ p, index, activeTag, onTag }) {
  const flip = index % 2 === 1
  return (
    <Reveal as="article" className="group grid items-start gap-8 lg:grid-cols-12 lg:gap-14">
      <div className={`lg:sticky lg:top-28 lg:col-span-7 ${flip ? 'lg:order-last' : ''}`}>
        <ProjectVisual p={p} large />
      </div>
      <div className="space-y-6 lg:col-span-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Meta p={p} />
            <StatusBadge status={p.status} />
          </div>
          <h3 className="mt-4 text-3xl font-medium tracking-[-0.03em] text-white sm:text-4xl">{p.name}</h3>
          {p.tagline && <p className="mt-3 font-serif text-xl leading-snug text-zinc-300 italic">{p.tagline}</p>}
        </div>
        <ProblemSolution p={p} />
        <Architecture items={p.architecture} />
        <Stack p={p} />
        <Highlights items={p.highlights} />
        <div className="flex flex-col gap-5 border-t border-white/[0.07] pt-6">
          <Tags p={p} activeTag={activeTag} onTag={onTag} />
          <Actions p={p} />
        </div>
      </div>
    </Reveal>
  )
}

function ProjectCard({ p, delay, activeTag, onTag }) {
  return (
    <Reveal
      as="article"
      delay={delay}
      onPointerMove={trackPointer}
      className="spotlight group flex flex-col rounded-3xl bg-white/[0.02] p-3 ring-1 ring-white/[0.08] transition-colors ring-inset hover:ring-white/15"
    >
      <ProjectVisual p={p} />
      <div className="flex flex-1 flex-col gap-5 px-3 pt-6 pb-3">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Meta p={p} />
            <StatusBadge status={p.status} />
          </div>
          <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-white">{p.name}</h3>
          {p.tagline && <p className="mt-2 text-sm text-zinc-400">{p.tagline}</p>}
        </div>
        <ProblemSolution p={p} />
        <Architecture items={p.architecture} />
        <Stack p={p} />
        <Highlights items={p.highlights} />
        {/* mt-auto : pieds de cartes alignés quelle que soit la longueur du texte */}
        <div className="mt-auto flex flex-col gap-4 border-t border-white/[0.07] pt-5">
          <Tags p={p} activeTag={activeTag} onTag={onTag} />
          <Actions p={p} />
        </div>
      </div>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* Section                                                            */
/* ------------------------------------------------------------------ */

export default function Projects() {
  const [category, setCategory] = useState(ALL)
  const [tag, setTag] = useState(null)
  const [aiOnly, setAiOnly] = useState(false)
  const [query, setQuery] = useState('')

  const categories = useMemo(() => [ALL, ...new Set(projects.map((p) => p.category))], [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((p) => {
      if (category !== ALL && p.category !== category) return false
      if (tag && !p.tags?.includes(tag)) return false
      if (aiOnly && !p.ai?.length) return false
      if (!q) return true
      return [p.name, p.tagline, p.problem, p.solution, ...(p.tags ?? []), ...(p.ai ?? []), ...(p.apis ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [category, tag, aiOnly, query])

  const featured = visible.filter((p) => p.featured)
  const others = visible.filter((p) => !p.featured)
  const toggleTag = (t) => setTag((cur) => (cur === t ? null : t))
  const reset = () => {
    setCategory(ALL)
    setTag(null)
    setAiOnly(false)
    setQuery('')
  }

  const pill = (active) =>
    `rounded-full px-3.5 py-1.5 text-sm transition ring-1 ring-inset ${
      active ? 'bg-white text-zinc-950 ring-white' : 'text-zinc-400 ring-white/10 hover:text-white hover:ring-white/25'
    }`

  return (
    <section id="projets" className="relative scroll-mt-24 border-t border-white/[0.06] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="02" eyebrow="Produits" title="Des problèmes réels," accent="des produits en ligne.">
          Chaque produit part d'un irritant concret. Pour chacun : le problème, l'idée directrice, l'architecture retenue et les
          modèles ou API mobilisés.
        </SectionHeading>

        <Reveal className="mb-16 flex flex-col gap-4 border-y border-white/[0.07] py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} className={pill(category === c)}>
                {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAiOnly((v) => !v)}
              aria-pressed={aiOnly}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm ring-1 transition ring-inset ${
                aiOnly ? 'bg-violet-300 text-zinc-950 ring-violet-300' : 'text-violet-300 ring-violet-300/30 hover:ring-violet-300/60'
              }`}
            >
              <Sparkles className="size-3.5" aria-hidden="true" /> IA intégrée
            </button>
          </div>
          <label className="relative block lg:w-72">
            <span className="sr-only">Rechercher un produit</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher : Claude, PWA, iOS…"
              className="w-full rounded-full bg-white/[0.03] py-2 pr-4 pl-10 text-sm text-zinc-200 ring-1 ring-white/10 transition ring-inset placeholder:text-zinc-600 focus:ring-white/30 focus:outline-none"
            />
          </label>
        </Reveal>

        {tag && (
          <p className="-mt-8 mb-10 flex items-center gap-2 text-sm text-zinc-400">
            Filtré par <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-xs text-zinc-950">#{tag}</span>
            <button type="button" onClick={() => setTag(null)} className="inline-flex items-center gap-1 text-zinc-500 hover:text-white">
              <X className="size-3.5" aria-hidden="true" /> retirer
            </button>
          </p>
        )}

        {visible.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl py-20 text-center ring-1 ring-white/10 ring-inset">
            <SearchX className="size-8 text-zinc-600" aria-hidden="true" />
            <p className="mt-4 text-zinc-400">Aucun produit ne correspond à ces filtres.</p>
            <button type="button" onClick={reset} className="mt-4 text-sm text-sky-300 hover:text-sky-200">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="space-y-24 sm:space-y-32">
                {featured.map((p, i) => (
                  <CaseStudy key={p.id} p={p} index={i} activeTag={tag} onTag={toggleTag} />
                ))}
              </div>
            )}
            {others.length > 0 && (
              <div className={featured.length ? 'mt-24 sm:mt-32' : ''}>
                {featured.length > 0 && (
                  <Reveal className="mb-10 flex items-center gap-4">
                    <h3 className="font-serif text-3xl text-white italic">Et aussi</h3>
                    <span className="h-px flex-1 bg-white/[0.07]" />
                  </Reveal>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                  {others.map((p, i) => (
                    <ProjectCard key={p.id} p={p} delay={(i % 2) * 120} activeTag={tag} onTag={toggleTag} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
