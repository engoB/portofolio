import { useState } from 'react'
import { ArrowUpRight, Briefcase, Check, Copy, Download, GraduationCap, Heart, Languages, Mail, Sparkles } from 'lucide-react'
import profile from '../data/profile.json'
import { ArtstationIcon, Chip, GithubIcon, ICONS, LinkedinIcon, Reveal, SectionHeading, asset, trackPointer } from './ui.jsx'

/* ------------------------------------------------------------------ */
/* 01 — Profil Product Builder                                        */
/* ------------------------------------------------------------------ */

export function ProfileSection() {
  return (
    <section id="profil" className="scroll-mt-24 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="01" eyebrow="Profil" title="Un profil hybride," accent="de bout en bout.">
          Le métier de Product Builder demande de tenir toute la chaîne : comprendre, designer, construire, livrer. Mon parcours
          m'a fait pratiquer chacun de ces maillons.
        </SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {profile.valueProps.map((v, i) => {
            const Icon = ICONS[v.icon] ?? Sparkles
            return (
              <Reveal
                key={v.title}
                delay={i * 90}
                onPointerMove={trackPointer}
                className="spotlight flex flex-col rounded-3xl bg-white/[0.02] p-7 ring-1 ring-white/[0.08] ring-inset"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-white/[0.04] text-sky-200 ring-1 ring-white/10 ring-inset">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-zinc-600">0{i + 1}</span>
                </div>
                <h3 className="mt-10 text-lg font-medium text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{v.text}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 03 — Parcours (CV augmenté)                                        */
/* ------------------------------------------------------------------ */

function SideBlock({ icon: Icon, title, children }) {
  return (
    <Reveal>
      <h3 className="mb-5 flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
        <Icon className="size-3.5 text-zinc-400" aria-hidden="true" /> {title}
      </h3>
      {children}
    </Reveal>
  )
}

export function Journey() {
  const { links } = profile
  return (
    <section id="parcours" className="scroll-mt-24 border-t border-white/[0.06] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading index="03" eyebrow="CV augmenté" title="Vingt ans de création," accent="un fil rouge : livrer." className="!mb-0" />
          {links.cv && (
            <Reveal>
              <a
                href={asset(links.cv)}
                download
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-zinc-200 ring-1 ring-white/15 transition ring-inset hover:bg-white/5 hover:text-white"
              >
                <Download className="size-4" aria-hidden="true" /> Télécharger le CV
              </a>
            </Reveal>
          )}
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="mb-8 flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
              <Briefcase className="size-3.5 text-zinc-400" aria-hidden="true" /> Expériences
            </h3>
            <ol className="relative">
              {profile.experience.map((e) => (
                <Reveal as="li" key={`${e.title}-${e.period}`} className="group relative grid gap-2 border-t border-white/[0.07] py-7 sm:grid-cols-[9rem_1fr] sm:gap-8">
                  <p className="pt-1 font-mono text-xs text-zinc-500">
                    {e.current && <span className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-emerald-400" />}
                    {e.period}
                  </p>
                  <div>
                    <h4 className="text-lg font-medium text-white">{e.title}</h4>
                    <p className="text-sm text-zinc-500">{e.org}</p>
                    {e.points?.length > 0 && (
                      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-400">
                        {e.points.map((pt) => (
                          <li key={pt} className="flex gap-3">
                            <span className="mt-[9px] h-px w-3 shrink-0 bg-zinc-600" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>

          <div className="space-y-14 lg:col-span-5 lg:pl-8">
            <SideBlock icon={GraduationCap} title="Formation">
              <ul className="space-y-3">
                {profile.education.map((ed) => (
                  <li key={`${ed.title}-${ed.period}`} className="rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.07] ring-inset">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-medium text-white">{ed.title}</p>
                      <p className="shrink-0 font-mono text-xs text-zinc-500">{ed.period}</p>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">{ed.org}</p>
                  </li>
                ))}
              </ul>
            </SideBlock>

            <SideBlock icon={Sparkles} title="Compétences">
              <div className="space-y-5">
                {profile.skills.map((s) => (
                  <div key={s.group}>
                    <p className="mb-2 text-sm text-zinc-300">{s.group}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.items.map((i) => (
                        <Chip key={i}>{i}</Chip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SideBlock>

            <div className="grid gap-10 sm:grid-cols-2">
              {profile.languages?.length > 0 && (
                <SideBlock icon={Languages} title="Langues">
                  <ul className="space-y-2 text-sm">
                    {profile.languages.map((l) => (
                      <li key={l.name} className="flex justify-between gap-4">
                        <span className="text-zinc-200">{l.name}</span>
                        <span className="text-zinc-500">{l.level}</span>
                      </li>
                    ))}
                  </ul>
                </SideBlock>
              )}
              {profile.interests?.length > 0 && (
                <SideBlock icon={Heart} title="Centres d'intérêt">
                  <p className="text-sm leading-relaxed text-zinc-400">{profile.interests.join(' · ')}</p>
                </SideBlock>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 04 — Méthode de travail assistée par IA                            */
/* ------------------------------------------------------------------ */

export function Method() {
  const { aiMethod } = profile
  return (
    <section id="methode" className="relative scroll-mt-24 overflow-hidden border-t border-white/[0.06] py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-64 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.14),transparent)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading index="04" eyebrow="Méthode" title="Travailler avec l'IA," accent="concrètement.">
          {aiMethod.intro}
        </SectionHeading>

        <div className="grid gap-4 md:grid-cols-2">
          {aiMethod.pillars.map((pl, i) => {
            const Icon = ICONS[pl.icon] ?? Sparkles
            return (
              <Reveal
                key={pl.title}
                delay={(i % 2) * 100}
                onPointerMove={trackPointer}
                className="spotlight flex gap-6 rounded-3xl bg-white/[0.02] p-7 ring-1 ring-white/[0.08] ring-inset sm:p-8"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-400/10 text-violet-200 ring-1 ring-violet-300/20 ring-inset">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-medium text-white">{pl.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{pl.text}</p>
                </div>
              </Reveal>
            )
          })}
        </div>

        {aiMethod.gains?.length > 0 && (
          <Reveal as="dl" className="mt-4 grid gap-px overflow-hidden rounded-3xl bg-white/[0.07] ring-1 ring-white/[0.07] sm:grid-cols-3">
            {aiMethod.gains.map((g) => (
              <div key={g.label} className="bg-ink p-8">
                <dd className="font-serif text-6xl text-aurora">{g.value}</dd>
                <dt className="mt-3 max-w-[16rem] text-sm text-zinc-400">{g.label}</dt>
              </div>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* 05 — Contact + pied de page                                        */
/* ------------------------------------------------------------------ */

function socialItems() {
  const { links } = profile
  return [
    links.github && { href: links.github, label: 'GitHub', Icon: GithubIcon },
    links.artstation && { href: links.artstation, label: 'ArtStation', Icon: ArtstationIcon },
    links.linkedin && { href: links.linkedin, label: 'LinkedIn', Icon: LinkedinIcon },
  ].filter(Boolean)
}

export function Contact() {
  const { links } = profile
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${links.email}`
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 px-5 pb-10 sm:px-8">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-zinc-950 px-6 py-20 text-center ring-1 ring-white/10 sm:px-12 sm:py-28">
        <div aria-hidden="true" className="absolute inset-0 -z-0">
          <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(56_189_248/0.18),transparent)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        </div>
        <div className="relative">
          <p className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 uppercase">05 — Contact</p>
          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-medium tracking-[-0.035em] text-white sm:text-6xl">
            Un produit à construire ? <span className="font-serif font-normal tracking-normal text-aurora italic">Parlons-en.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-zinc-400">
            Je cherche une équipe où la sensibilité design, la culture de production et l'IA se rencontrent.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {links.email && (
              <>
                <a
                  href={`mailto:${links.email}`}
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
                >
                  <Mail className="size-4" aria-hidden="true" /> {links.email}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-zinc-300 ring-1 ring-white/15 transition ring-inset hover:bg-white/5"
                >
                  {copied ? <Check className="size-4 text-emerald-300" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                  {copied ? 'Copié' : "Copier l'adresse"}
                </button>
              </>
            )}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {socialItems().map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <Icon className="size-4" /> {label}
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p>
        © {new Date().getFullYear()} {profile.name} — {profile.role}
      </p>
      <p>
        Conçu et codé avec <span className="text-zinc-400">React</span>, <span className="text-zinc-400">Tailwind CSS</span> et{' '}
        <span className="text-zinc-400">Claude Code</span>.
      </p>
    </footer>
  )
}
