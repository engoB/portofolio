import { useEffect, useRef } from 'react'
import {
  Bot,
  CodeXml,
  Compass,
  Eye,
  Gauge,
  Lightbulb,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Telescope,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'
import { usePrefs } from '../lib/prefs.jsx'

/* Icônes référencées par clé dans le contenu (liste proposée dans l'espace perso) */
export const ICONS = {
  target: Target,
  users: Users,
  rocket: Rocket,
  compass: Compass,
  palette: Palette,
  code: CodeXml,
  workflow: Workflow,
  bot: Bot,
  shield: ShieldCheck,
  telescope: Telescope,
  gauge: Gauge,
  zap: Zap,
  eye: Eye,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
}

export const STATUS_STYLE = {
  live: { dot: 'bg-emerald-500', cls: 'text-emerald-700 bg-emerald-500/10 ring-emerald-600/20 dark:text-emerald-300 dark:ring-emerald-400/25' },
  beta: { dot: 'bg-sky-500', cls: 'text-sky-700 bg-sky-500/10 ring-sky-600/20 dark:text-sky-300 dark:ring-sky-400/25' },
  wip: { dot: 'bg-amber-500', cls: 'text-amber-700 bg-amber-500/10 ring-amber-600/20 dark:text-amber-300 dark:ring-amber-400/25' },
  prototype: { dot: 'bg-violet-500', cls: 'text-violet-700 bg-violet-500/10 ring-violet-600/20 dark:text-violet-300 dark:ring-violet-400/25' },
  archived: { dot: 'bg-zinc-400', cls: 'text-muted bg-zinc-500/10 ring-line' },
}

export function StatusBadge({ status }) {
  const { ui } = usePrefs()
  const s = STATUS_STYLE[status]
  if (!s) return null
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {ui.status[status]}
    </span>
  )
}

/* Pose --mx / --my pour l'effet .spotlight */
export const trackPointer = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, ...rest }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.dataset.visible = 'true'
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = 'true'
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}ms`, ...style }} {...rest}>
      {children}
    </Tag>
  )
}

export function SectionHeading({ eyebrow, title, accent, children, className = '' }) {
  const { tr } = usePrefs()
  return (
    <Reveal className={`mb-12 max-w-3xl sm:mb-14 ${className}`}>
      <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-subtle uppercase">
        <span className="h-px w-8 bg-current opacity-50" />
        {tr(eyebrow)}
      </p>
      <h2 className="mt-5 text-4xl font-medium tracking-[-0.035em] text-balance text-fg sm:text-5xl">
        {tr(title)} {accent && <span className="font-serif font-normal tracking-normal text-grad italic">{tr(accent)}</span>}
      </h2>
      {children && <p className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted sm:text-lg">{children}</p>}
    </Reveal>
  )
}

export function Chip({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-card text-fg2 ring-line',
    ai: 'bg-violet-500/10 text-violet-700 ring-violet-500/25 dark:text-violet-200',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${tones[tone]}`}>{children}</span>
}

/* Cadres de présentation des captures */
export function BrowserFrame({ src, alt, className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl bg-zinc-900 shadow-2xl ring-1 shadow-black/30 ring-black/10 dark:shadow-black/60 dark:ring-white/10 ${className}`}>
      <div className="flex items-center gap-1.5 bg-zinc-800 px-3 py-2">
        <span className="size-2 rounded-full bg-zinc-600" />
        <span className="size-2 rounded-full bg-zinc-600" />
        <span className="size-2 rounded-full bg-zinc-600" />
      </div>
      <img src={src} alt={alt} loading="lazy" decoding="async" draggable="false" className="block aspect-[16/10] w-full object-cover object-top" />
    </div>
  )
}

export function PhoneFrame({ src, alt, className = '', style }) {
  return (
    <div className={`rounded-[2.1rem] bg-zinc-900 p-[7px] shadow-2xl ring-1 shadow-black/30 ring-black/10 dark:shadow-black/60 dark:ring-white/15 ${className}`} style={style}>
      <div className="relative overflow-hidden rounded-[1.7rem] bg-black">
        <span className="absolute top-1.5 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
        <img src={src} alt={alt} loading="lazy" decoding="async" draggable="false" className="block aspect-[390/844] w-full object-cover object-top" />
      </div>
    </div>
  )
}

/* Lucide ne fournit plus les logos de marque */
export function GithubIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

export function LinkedinIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

export function ArtstationIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M0 17.72 2.03 21.2a2.43 2.43 0 0 0 2.16 1.33h13.4l-2.78-4.81H0Zm24 .02c0-.48-.14-.93-.39-1.3L15.76 2.8A2.42 2.42 0 0 0 13.62 1.5H9.48l12.1 20.96 1.91-3.3c.37-.62.51-.9.51-1.42Zm-11.14-2.74L7.45 5.62 2.03 15h10.83Z" />
    </svg>
  )
}
