import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Lock, Plus, X } from 'lucide-react'
import { useAsset, usePrefs } from '../lib/prefs.jsx'
import { BrowserFrame, Chip, GithubIcon, PhoneFrame, Reveal, SectionHeading, StatusBadge } from './ui.jsx'
import { Comments, ShareBar, trackView } from './Social.jsx'
import { DemoLink, MobileHint } from './PhoneDemo.jsx'
import { href } from '../lib/route.js'
import { paths, publicUrl } from '../lib/site-url.js'

/* Visuel de carte : deux téléphones, ou une fenêtre de navigateur, sur un halo coloré */
function CardVisual({ p }) {
  const asset = useAsset()
  const accent = p.accent || '#7dd3fc'
  const imgs = p.images ?? []
  const phones = imgs.filter((i) => i.kind === 'mobile').slice(0, 2)
  const desktop = imgs.find((i) => i.kind !== 'mobile')
  const lead = imgs[0]

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 bg-bg2" />
      <div aria-hidden="true" className="absolute inset-0" style={{ background: `radial-gradient(90% 80% at 50% 105%, ${accent}55, transparent 70%)` }} />
      <div aria-hidden="true" className="bg-gridlines absolute inset-0 bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      {!lead ? (
        <div className="absolute inset-0 grid place-items-center font-serif text-8xl text-fg/15 italic">{p.name.charAt(0)}</div>
      ) : lead.kind === 'mobile' || !desktop ? (
        <div className="absolute inset-x-0 top-7 flex justify-center gap-3 transition-transform duration-700 ease-out group-hover:-translate-y-2">
          {phones.map((img, i) => (
            <PhoneFrame key={img.src} src={asset(img.src)} alt="" className={`w-[42%] max-w-[170px] ${i === 1 ? 'mt-10' : ''}`} />
          ))}
        </div>
      ) : (
        <div className="absolute top-8 left-7 w-[118%] transition-transform duration-700 ease-out group-hover:-translate-y-2">
          <BrowserFrame src={asset(desktop.src)} alt="" />
        </div>
      )}
    </div>
  )
}

function ProjectCard({ p, onOpen }) {
  const { tr, ui } = usePrefs()
  return (
    <article className="group flex w-[84vw] max-w-[440px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] bg-card ring-1 ring-line transition-shadow ring-inset hover:shadow-2xl hover:shadow-black/10 sm:w-[420px]">
      <button type="button" onClick={onOpen} className="relative block h-[300px] cursor-pointer text-left" aria-label={`${ui.open} ${p.name}`}>
        <CardVisual p={p} />
      </button>
      <div className="flex flex-1 flex-col border-t border-line p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-fg">{p.name}</h3>
          <StatusBadge status={p.status} />
        </div>
        <p className="mt-3 font-serif text-[1.65rem] leading-[1.15] text-balance text-fg italic">{tr(p.hook)}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{tr(p.pitch)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition hover:opacity-85"
          >
            <Plus className="size-4" aria-hidden="true" /> {ui.discover}
          </button>
          {p.demo && (
            <DemoLink
              p={p}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm text-fg2 ring-1 ring-line transition ring-inset hover:text-fg hover:ring-fg/30"
            >
              {tr(p.demoLabel) || ui.open} <ArrowUpRight className="size-4" aria-hidden="true" />
            </DemoLink>
          )}
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Fiche détaillée (dialog natif : Échap ferme, focus géré)            */
/* ------------------------------------------------------------------ */

function Fold({ title, children, defaultOpen }) {
  return (
    <details open={defaultOpen} className="group/f border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-medium text-fg [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 text-subtle transition-transform group-open/f:rotate-180" aria-hidden="true" />
      </summary>
      <p className="pb-5 text-[15px] leading-relaxed text-pretty text-muted">{children}</p>
    </details>
  )
}

function ProjectDialog({ project: p, site, onClose, onPrev, onNext }) {
  const ref = useRef(null)
  const { tr, ui } = usePrefs()
  const asset = useAsset()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (!d.open) d.showModal()
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])
  useEffect(() => {
    ref.current?.querySelector('[data-scroll]')?.scrollTo({ top: 0 })
  }, [p.id])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      aria-label={p.name}
      className="m-auto h-[100dvh] max-h-[100dvh] w-full max-w-none bg-transparent p-0 text-fg2 sm:h-[calc(100dvh-3rem)] sm:w-[min(1120px,calc(100%-3rem))]"
    >
      <div className="flex h-full flex-col overflow-hidden bg-bg2 ring-1 ring-line sm:rounded-[2rem]">
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.accent }} />
            <h3 className="truncate font-medium text-fg">{p.name}</h3>
            <StatusBadge status={p.status} />
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onPrev} aria-label={ui.prev} className="grid size-9 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg">
              <ArrowLeft className="size-4" />
            </button>
            <button type="button" onClick={onNext} aria-label={ui.next} className="grid size-9 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg">
              <ArrowRight className="size-4" />
            </button>
            <button type="button" onClick={() => ref.current?.close()} aria-label={ui.close} className="grid size-9 place-items-center rounded-full bg-fg/5 text-fg hover:bg-fg/10">
              <X className="size-4" />
            </button>
          </div>
        </header>

        <div data-scroll className="flex-1 overflow-y-auto overscroll-contain">
          {p.images?.length > 0 && (
            <div className="relative border-b border-line" style={{ background: `radial-gradient(70% 90% at 50% 120%, ${p.accent}40, transparent 70%)` }}>
              <div className="no-scrollbar flex snap-x snap-mandatory items-end gap-5 overflow-x-auto px-5 py-8 sm:px-8" aria-label={ui.gallery}>
                {p.images.map((img, i) =>
                  img.kind === 'mobile' ? (
                    <PhoneFrame key={img.src + i} src={asset(img.src)} alt={`${p.name} — ${i + 1}`} className="w-[210px] shrink-0 snap-center sm:w-[240px]" />
                  ) : (
                    <BrowserFrame key={img.src + i} src={asset(img.src)} alt={`${p.name} — ${i + 1}`} className="w-[85vw] shrink-0 snap-center sm:w-[640px]" />
                  ),
                )}
              </div>
            </div>
          )}

          <div className="grid gap-10 px-5 py-10 sm:px-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <p className="font-serif text-3xl leading-tight text-balance text-fg italic sm:text-4xl">{tr(p.hook)}</p>
              <p className="mt-5 text-lg leading-relaxed text-pretty text-fg2">{tr(p.pitch)}</p>
              <div className="mt-8 border-t border-line">
                {tr(p.problem) && <Fold title={ui.problem}>{tr(p.problem)}</Fold>}
                {tr(p.idea) && <Fold title={ui.idea}>{tr(p.idea)}</Fold>}
                {tr(p.how) && <Fold title={ui.how}>{tr(p.how)}</Fold>}
              </div>
            </div>
            <aside className="space-y-8 lg:col-span-4">
              {p.ai?.length > 0 && (
                <div>
                  <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">{ui.ai}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.ai.map((a) => (
                      <Chip key={tr(a)} tone="ai">
                        {tr(a)}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
              {p.stack?.length > 0 && (
                <div>
                  <p className="mb-3 font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">{ui.stack}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <Chip key={tr(s)}>{tr(s)}</Chip>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2">
                {p.demo && (
                  <DemoLink
                    p={p}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg transition hover:opacity-85"
                  >
                    {tr(p.demoLabel) || ui.open} <ArrowUpRight className="size-4" aria-hidden="true" />
                  </DemoLink>
                )}
                <MobileHint p={p} className="justify-center pb-1" />
                {p.repo &&
                  (p.repoPrivate ? (
                    <span className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm text-subtle ring-1 ring-line ring-inset">
                      <Lock className="size-3.5" aria-hidden="true" /> {ui.privateCode}
                    </span>
                  ) : (
                    <a
                      href={p.repo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm text-fg2 ring-1 ring-line transition ring-inset hover:text-fg hover:ring-fg/30"
                    >
                      <GithubIcon className="size-3.5" /> {ui.code}
                    </a>
                  ))}
              </div>
            </aside>
          </div>
          {site && (
            <div className="space-y-8 border-t border-line px-5 py-10 sm:px-8">
              <ShareBar url={publicUrl(site) + paths.project(p.id)} title={`${p.name} — ${tr(p.hook)}`} />
              <Comments term={`projets/${p.id}`} feedback={site.feedback} email={site.links?.email} />
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Section : carrousel horizontal                                      */
/* ------------------------------------------------------------------ */

export default function Projects({ section, projects, site, initialOpenId }) {
  const { tr, ui } = usePrefs()
  const list = useMemo(() => projects.filter((p) => p.visible !== false), [projects])
  const [openId, setOpenId] = useState(() => (list.some((p) => p.id === initialOpenId) ? initialOpenId : null))

  /* L'adresse suit la fiche ouverte : /projets/<id>/ se partage tel quel */
  const inAdmin = window.location.hash.startsWith('#/admin')
  useEffect(() => {
    if (inAdmin) return
    const target = openId ? href(paths.project(openId)) : href()
    if (window.location.pathname !== target) window.history.replaceState(null, '', target + (openId ? '' : window.location.hash))
    const opened = list.find((p) => p.id === openId)
    if (site) document.title = opened ? `${opened.name} — ${tr(opened.hook)}` : `${site.identity.name} — ${tr(site.identity.role)}`
    if (opened) trackView(`/${paths.project(opened.id)}`, opened.name)
  }, [openId]) // eslint-disable-line react-hooks/exhaustive-deps
  const track = useRef(null)
  const drag = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const updateEdges = () => {
    const t = track.current
    if (!t) return
    setEdges({ start: t.scrollLeft < 8, end: t.scrollLeft + t.clientWidth > t.scrollWidth - 8 })
  }
  useEffect(updateEdges, [list.length])

  const scrollByCard = (dir) => {
    const t = track.current
    const card = t?.querySelector('article')
    if (!t || !card) return
    t.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: 'smooth' })
  }

  /* Glisser à la souris (le tactile et le trackpad défilent nativement) */
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 5 && !d.moved) {
      d.moved = true
      track.current.style.scrollSnapType = 'none'
      track.current.setPointerCapture(e.pointerId)
    }
    if (d.moved) track.current.scrollLeft = d.left - dx
  }
  const endDrag = () => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    track.current.style.scrollSnapType = ''
    // Empêche le clic qui suit un glisser d'ouvrir une fiche
    const block = (ev) => {
      ev.stopPropagation()
      ev.preventDefault()
    }
    track.current.addEventListener('click', block, { capture: true, once: true })
    setTimeout(() => track.current?.removeEventListener('click', block, { capture: true }), 0)
  }

  const index = list.findIndex((p) => p.id === openId)
  const open = index >= 0 ? list[index] : null
  const step = (d) => setOpenId(list[(index + d + list.length) % list.length].id)

  if (!list.length) return null

  return (
    <section id="projets" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} accent={section.accent} className="!mb-0">
          {tr(section.intro)}
        </SectionHeading>
        <div className="flex items-center gap-2">
          <span className="mr-2 hidden font-mono text-[11px] tracking-[0.2em] text-subtle uppercase sm:inline">{ui.scrollHint} →</span>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={edges.start}
            aria-label={ui.prev}
            className="grid size-11 place-items-center rounded-full text-fg ring-1 ring-line transition ring-inset hover:bg-fg/5 disabled:opacity-30"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={edges.end}
            aria-label={ui.next}
            className="grid size-11 place-items-center rounded-full text-fg ring-1 ring-line transition ring-inset hover:bg-fg/5 disabled:opacity-30"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <Reveal>
        <div
          ref={track}
          onScroll={updateEdges}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-8 select-none sm:scroll-px-8 sm:px-8 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        >
          {list.map((p) => (
            <ProjectCard key={p.id} p={p} onOpen={() => setOpenId(p.id)} />
          ))}
          <span aria-hidden="true" className="w-px shrink-0" />
        </div>
      </Reveal>

      {open && <ProjectDialog key="dialog" project={open} site={site} onClose={() => setOpenId(null)} onPrev={() => step(-1)} onNext={() => step(1)} />}
    </section>
  )
}
