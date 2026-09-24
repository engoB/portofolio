import { useEffect, useRef } from 'react'
import { Bot, CodeXml, Gauge, Palette, ShieldCheck, Sparkles, Target, Telescope, Workflow, Zap } from 'lucide-react'

/* Icônes référencées par clé depuis profile.json */
export const ICONS = {
  target: Target,
  palette: Palette,
  code: CodeXml,
  gauge: Gauge,
  workflow: Workflow,
  bot: Bot,
  shield: ShieldCheck,
  telescope: Telescope,
  zap: Zap,
  sparkles: Sparkles,
}

export const STATUS = {
  production: { label: 'En production', dot: 'bg-emerald-400', cls: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/25' },
  beta: { label: 'Bêta', dot: 'bg-sky-400', cls: 'text-sky-300 bg-sky-400/10 ring-sky-400/25' },
  'en-cours': { label: 'En cours', dot: 'bg-amber-400', cls: 'text-amber-300 bg-amber-400/10 ring-amber-400/25' },
  prototype: { label: 'Prototype', dot: 'bg-violet-400', cls: 'text-violet-300 bg-violet-400/10 ring-violet-400/25' },
  archive: { label: 'Archivé', dot: 'bg-zinc-500', cls: 'text-zinc-400 bg-zinc-800 ring-zinc-700' },
}

/* Chemin d'un fichier de public/, compatible avec le base path GitHub Pages */
export const asset = (path) => (!path || /^https?:\/\//.test(path) ? path : `${import.meta.env.BASE_URL}${path}`)

/* Pose --mx / --my pour l'effet .spotlight */
export const trackPointer = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
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
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}

export function Eyebrow({ index, children }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
      {index && <span className="text-zinc-300">{index}</span>}
      <span className="h-px w-8 bg-zinc-700" />
      {children}
    </p>
  )
}

export function SectionHeading({ index, eyebrow, title, accent, children, className = '' }) {
  return (
    <Reveal className={`mb-14 max-w-3xl ${className}`}>
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      <h2 className="mt-6 text-4xl font-medium tracking-[-0.03em] text-white sm:text-5xl">
        {title} {accent && <span className="font-serif font-normal italic tracking-normal text-aurora">{accent}</span>}
      </h2>
      {children && <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">{children}</p>}
    </Reveal>
  )
}

export function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.prototype
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export function Chip({ children, tone = 'neutral', icon: Icon }) {
  const tones = {
    neutral: 'bg-white/[0.04] text-zinc-300 ring-white/10',
    ai: 'bg-violet-400/10 text-violet-200 ring-violet-300/25',
    built: 'bg-emerald-400/[0.07] text-emerald-200 ring-emerald-300/20',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${tones[tone]}`}>
      {Icon && <Icon className="size-3" aria-hidden="true" />}
      {children}
    </span>
  )
}

/* Cadres de présentation des captures */
export function BrowserFrame({ src, alt, url }) {
  return (
    <div className="overflow-hidden rounded-xl bg-zinc-900 shadow-2xl ring-1 shadow-black/60 ring-white/10">
      <div className="flex items-center gap-2 border-b border-white/5 bg-zinc-900/90 px-3 py-2">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
        </span>
        {url && (
          <span className="mx-auto max-w-[70%] truncate rounded-md bg-white/5 px-3 py-0.5 font-mono text-[10px] text-zinc-500">{url}</span>
        )}
      </div>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block aspect-[16/10] w-full object-cover object-top" />
    </div>
  )
}

export function PhoneFrame({ src, alt, className = '' }) {
  return (
    <div className={`rounded-[2.4rem] bg-zinc-900 p-2 shadow-2xl ring-1 shadow-black/60 ring-white/15 ${className}`}>
      <div className="relative overflow-hidden rounded-[1.9rem] bg-black">
        <span className="absolute top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
        <img src={src} alt={alt} loading="lazy" decoding="async" className="block aspect-[390/844] w-full object-cover object-top" />
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
