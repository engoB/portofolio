import { useState } from 'react'
import { ArrowDown, Download, MapPin, Menu, X } from 'lucide-react'
import profile from '../data/profile.json'
import { ArtstationIcon, GithubIcon, LinkedinIcon, Reveal, asset } from './ui.jsx'

const NAV = [
  { href: '#profil', label: 'Profil' },
  { href: '#projets', label: 'Produits' },
  { href: '#parcours', label: 'Parcours' },
  { href: '#methode', label: 'Méthode IA' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-full bg-zinc-950/70 py-2 pr-2 pl-2 shadow-2xl ring-1 shadow-black/40 ring-white/10 backdrop-blur-xl">
        <a href="#top" className="flex items-center gap-2.5" aria-label="Retour en haut">
          <span className="grid size-9 place-items-center rounded-full bg-white/[0.06] font-serif text-lg text-aurora italic ring-1 ring-white/10">
            {profile.initials}
          </span>
          <span className="hidden text-sm font-medium text-white sm:block">{profile.name}</span>
        </a>
        <ul className="hidden items-center gap-1 text-sm text-zinc-400 md:flex">
          {NAV.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-3 py-1.5 transition hover:bg-white/5 hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <a href="#contact" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200">
            Contact
          </a>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full text-zinc-300 hover:bg-white/5 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>
      {open && (
        <ul className="mx-auto mt-2 max-w-3xl space-y-1 rounded-3xl bg-zinc-950/90 p-2 ring-1 ring-white/10 backdrop-blur-xl md:hidden">
          {NAV.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-zinc-300 hover:bg-white/5">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

function SocialLinks() {
  const { links } = profile
  const items = [
    links.github && { href: links.github, label: 'GitHub', Icon: GithubIcon },
    links.artstation && { href: links.artstation, label: 'ArtStation', Icon: ArtstationIcon },
    links.linkedin && { href: links.linkedin, label: 'LinkedIn', Icon: LinkedinIcon },
  ].filter(Boolean)
  return items.map(({ href, label, Icon }) => (
    <a
      key={label}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="grid size-11 place-items-center rounded-full text-zinc-400 ring-1 ring-white/10 transition ring-inset hover:bg-white/5 hover:text-white"
    >
      <Icon className="size-4" />
    </a>
  ))
}

export function Hero({ stats }) {
  const { headline, links } = profile
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-12 sm:pt-44 sm:pb-16">
      {/* Ambiance */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-56 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(99_102_241/0.18),transparent)]" />
        <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(56_189_248/0.12),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300 ring-1 ring-emerald-400/25 ring-inset">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              {profile.availability}
            </span>
            <span className="inline-flex items-center gap-1.5 text-zinc-500">
              <MapPin className="size-3.5" aria-hidden="true" /> {profile.location}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-10 font-mono text-xs tracking-[0.22em] text-zinc-500 uppercase">
              {profile.name} — <span className="text-zinc-300">{profile.role}</span>
            </p>
            <h1 className="mt-5 text-[2.75rem] leading-[1.02] font-medium tracking-[-0.045em] text-white sm:text-7xl lg:text-[5rem]">
              {headline.before}{' '}
              <span className="font-serif font-normal tracking-[-0.01em] text-aurora italic">{headline.accent}</span>
              <span className="mt-4 block text-[1.6rem] leading-tight tracking-[-0.03em] text-zinc-500 sm:text-4xl lg:text-[2.6rem]">{headline.after}</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-400">{profile.pitch}</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#projets"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-950 shadow-[0_0_40px_-8px_rgb(125_211_252/0.6)] transition hover:bg-zinc-200"
              >
                Voir les produits
                <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </a>
              {links.cv && (
                <a
                  href={asset(links.cv)}
                  download
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-zinc-200 ring-1 ring-white/15 transition ring-inset hover:bg-white/5 hover:text-white"
                >
                  <Download className="size-4" aria-hidden="true" /> CV (PDF)
                </a>
              )}
              <SocialLinks />
            </div>
          </Reveal>
        </div>

        {/* Carte profil */}
        <Reveal delay={240} className="lg:col-span-5">
          <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-[22rem]">
            <div aria-hidden="true" className="absolute -inset-px rounded-[2rem] bg-gradient-to-b from-white/25 via-white/5 to-white/0" />
            <div className="relative rounded-[2rem] bg-zinc-950/90 p-3 backdrop-blur">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                {profile.photo && (
                  <img
                    src={asset(profile.photo)}
                    alt={`Portrait de ${profile.name}`}
                    width="250"
                    height="310"
                    className="aspect-[4/5] w-full object-cover saturate-[.85]"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent p-5 pt-20">
                  <p className="text-lg font-medium text-white">{profile.name}</p>
                  <p className="text-sm text-zinc-400">
                    {profile.role} <span className="text-zinc-600">·</span> ex-{profile.formerRole}
                  </p>
                </div>
              </div>
            </div>
            <span className="animate-float absolute top-8 -left-1 rounded-full bg-zinc-900/90 px-3 py-1.5 font-mono text-[11px] text-zinc-300 shadow-xl ring-1 ring-white/10 backdrop-blur sm:-left-12">
              ✦ 3D · VR · WebGL
            </span>
            <span className="animate-float absolute -right-1 bottom-28 rounded-full bg-zinc-900/90 px-3 py-1.5 font-mono text-[11px] text-violet-200 shadow-xl ring-1 ring-violet-300/25 backdrop-blur [animation-delay:-3s] sm:-right-10">
              ✦ Claude Code
            </span>
          </div>
        </Reveal>
      </div>

      {/* Chiffres clés */}
      <div className="mx-auto mt-20 max-w-7xl px-5 sm:mt-24 sm:px-8">
        <Reveal as="dl" className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/[0.07] ring-1 ring-white/[0.07] lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-ink px-6 py-7 sm:px-8">
              <dd className="font-serif text-5xl text-white">{s.value}</dd>
              <dt className="mt-2 text-sm text-zinc-500">{s.label}</dt>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

export function Toolbelt() {
  const items = profile.toolbelt ?? []
  if (!items.length) return null
  return (
    <div className="relative overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" aria-label="Outils">
      <ul className="animate-marquee flex w-max gap-10 pr-10">
        {[...items, ...items].map((t, i) => (
          <li key={i} aria-hidden={i >= items.length} className="flex items-center gap-10 font-mono text-sm whitespace-nowrap text-zinc-500">
            {t}
            <span className="text-zinc-700">✦</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
