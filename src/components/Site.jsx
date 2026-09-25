import { useState } from 'react'
import { ArrowDown, ArrowUpRight, Check, Copy, Mail, MapPin, Menu, Moon, Rss, Sparkles, Sun, X } from 'lucide-react'
import { useAsset, usePrefs } from '../lib/prefs.jsx'
import Projects from './Projects.jsx'
import { JournalPage, JournalSection, LegalPage, NotFound, PostPage, publishedPosts } from './Journal.jsx'
import { SOCIAL_ICONS, SOCIAL_NAMES, useAnalytics } from './Social.jsx'
import { href } from '../lib/route.js'
import { paths } from '../lib/site-url.js'
import {
  ArtstationIcon,
  BrowserFrame,
  Chip,
  GithubIcon,
  ICONS,
  PhoneFrame,
  Reveal,
  SectionHeading,
  trackPointer,
} from './ui.jsx'

/* ------------------------------------------------------------------ */
/* Navigation                                                         */
/* ------------------------------------------------------------------ */

function PrefToggles() {
  const { lang, setLang, dark, toggleTheme, ui } = usePrefs()
  return (
    <>
      <button
        type="button"
        onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        aria-label={ui.lang.switch}
        title={ui.lang.switch}
        className="grid h-9 min-w-9 place-items-center rounded-full px-2 font-mono text-xs text-fg2 transition hover:bg-fg/5 hover:text-fg"
      >
        {ui.lang.short}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={dark ? ui.theme.toLight : ui.theme.toDark}
        title={dark ? ui.theme.toLight : ui.theme.toDark}
        className="grid size-9 place-items-center rounded-full text-fg2 transition hover:bg-fg/5 hover:text-fg"
      >
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </>
  )
}

function Nav({ site, hasJournal }) {
  const { ui } = usePrefs()
  const [open, setOpen] = useState(false)
  const s = site.sections
  // Liens absolus vers l'accueil : ils fonctionnent aussi depuis le journal
  const home = href()
  const links = [
    s.manifesto && { href: `${home}#experimentation`, label: ui.nav.manifesto },
    s.projects && { href: `${home}#projets`, label: ui.nav.projects },
    hasJournal && { href: href(paths.journal), label: ui.nav.journal },
    s.method && { href: `${home}#methode`, label: ui.nav.method },
    s.why && { href: `${home}#profil`, label: ui.nav.why },
  ].filter(Boolean)

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full bg-bg2/75 p-1.5 shadow-xl ring-1 shadow-black/5 ring-line backdrop-blur-xl dark:shadow-black/40">
        <a href={`${home}#top`} className="flex items-center gap-2.5 pr-2" aria-label={site.identity.name}>
          <span className="grid size-9 place-items-center rounded-full bg-fg/[0.06] font-serif text-lg text-grad italic ring-1 ring-line">
            {site.identity.initials}
          </span>
          <span className="hidden text-sm font-medium text-fg sm:block">{site.identity.name}</span>
        </a>
        <ul className="hidden items-center gap-0.5 text-sm text-muted md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-3 py-1.5 transition hover:bg-fg/5 hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-0.5">
          <PrefToggles />
          {s.contact && (
            <a href={`${home}#contact`} className="ml-1 hidden rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition hover:opacity-85 sm:block">
              {ui.nav.contact}
            </a>
          )}
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full text-fg2 hover:bg-fg/5 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={ui.menu}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>
      {open && (
        <ul className="mx-auto mt-2 max-w-3xl space-y-1 rounded-3xl bg-bg2/95 p-2 ring-1 ring-line backdrop-blur-xl md:hidden">
          {[...links, s.contact && { href: `${home}#contact`, label: ui.nav.contact }].filter(Boolean).map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-fg2 hover:bg-fg/5">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}

/* En-tête du journal : un espace à part, avec un retour vers le portfolio */
function JournalNav({ site }) {
  const { tr } = usePrefs()
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full bg-bg2/80 p-1.5 shadow-xl ring-1 shadow-black/5 ring-line backdrop-blur-xl dark:shadow-black/40">
        <a href={href(paths.journal)} className="flex min-w-0 items-center gap-2.5 pr-2">
          <span className="hidden size-9 shrink-0 place-items-center rounded-full bg-fg/[0.06] font-serif text-lg text-grad italic ring-1 ring-line sm:grid">{site.identity.initials}</span>
          <span className="truncate pl-2 font-serif text-xl text-fg sm:pl-0">{tr(site.journal.name) || 'Journal'}</span>
        </a>
        <div className="flex items-center gap-0.5">
          <a href={href('feed.xml')} aria-label="RSS" title="RSS" className="hidden size-9 place-items-center sm:grid rounded-full text-fg2 transition hover:bg-fg/5 hover:text-fg">
            <Rss className="size-4" />
          </a>
          <PrefToggles />
          <a href={href()} className="ml-1 inline-flex items-center gap-1 rounded-full bg-fg px-3.5 py-2 text-sm font-medium text-bg transition hover:opacity-85 sm:px-4">
            Portfolio <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </nav>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                               */
/* ------------------------------------------------------------------ */

function HeroCollage({ projects }) {
  const asset = useAsset()
  const visible = projects.filter((p) => p.visible !== false && p.images?.length)
  // Trois produits différents : une fenêtre de navigateur et deux téléphones
  const withDesktop = visible.find((p) => p.images.some((i) => i.kind !== 'mobile'))
  const desktop = withDesktop?.images.find((i) => i.kind !== 'mobile')
  const phones = visible
    .filter((p) => p !== withDesktop)
    .map((p) => p.images.find((i) => i.kind === 'mobile'))
    .filter(Boolean)
  if (!desktop && !phones.length) return null
  return (
    <div aria-hidden="true" className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[500px]">
      {desktop && (
        <div className="animate-float absolute top-0 right-0 w-[88%]" style={{ '--r': '2deg' }}>
          <BrowserFrame src={asset(desktop.src)} alt="" />
        </div>
      )}
      {phones[0] && (
        <PhoneFrame src={asset(phones[0].src)} alt="" className="animate-float absolute bottom-0 left-0 w-[38%] [animation-delay:-2s]" style={{ '--r': '-5deg' }} />
      )}
      {phones[1] && (
        <PhoneFrame src={asset(phones[1].src)} alt="" className="animate-float absolute right-[8%] bottom-[-6%] w-[34%] [animation-delay:-4.5s]" style={{ '--r': '4deg' }} />
      )}
    </div>
  )
}

function Hero({ site, projects }) {
  const { tr } = usePrefs()
  const asset = useAsset()
  const { identity, hero, sections } = site
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-56 left-1/2 h-[640px] w-[1100px] -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(closest-side, var(--glow-a), transparent)' }} />
        <div className="absolute top-48 -right-40 h-[520px] w-[520px] rounded-full" style={{ background: 'radial-gradient(closest-side, var(--glow-b), transparent)' }} />
        <div className="bg-gridlines absolute inset-0 bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-6 xl:col-span-6">
          <Reveal className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            {identity.showPhoto && identity.photo && (
              <img src={asset(identity.photo)} alt="" className="size-10 rounded-full object-cover ring-2 ring-bg2" />
            )}
            <div className="leading-tight">
              <p className="font-medium text-fg">{identity.name}</p>
              <p className="text-xs text-muted">
                {tr(identity.role)}
                {tr(identity.location) && (
                  <>
                    {' · '}
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" aria-hidden="true" /> {tr(identity.location)}
                    </span>
                  </>
                )}
              </p>
            </div>
            {identity.showStatus && tr(identity.status) && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-700 ring-1 ring-emerald-600/20 ring-inset sm:ml-2 dark:text-emerald-300 dark:ring-emerald-400/25">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                {tr(identity.status)}
              </span>
            )}
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-12 font-mono text-[11px] tracking-[0.25em] text-subtle uppercase">{tr(hero.kicker)}</p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.03] font-medium tracking-[-0.045em] text-balance text-fg sm:text-6xl lg:text-[4.2rem]">
              {tr(hero.title)} <span className="font-serif font-normal tracking-[-0.01em] text-grad italic">{tr(hero.accent)}</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-pretty text-muted">{tr(hero.intro)}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {sections.projects && (
                <a href="#projets" className="group inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition hover:opacity-85">
                  {tr(hero.ctaPrimary)}
                  <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
                </a>
              )}
              {sections.contact && (
                <a href="#contact" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-fg2 ring-1 ring-line transition ring-inset hover:text-fg hover:ring-fg/30">
                  {tr(hero.ctaSecondary)}
                </a>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={240} className="lg:col-span-6">
          <HeroCollage projects={projects} />
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* L'expérimentation                                                  */
/* ------------------------------------------------------------------ */

function Manifesto({ data }) {
  const { tr } = usePrefs()
  return (
    <section id="experimentation" className="scroll-mt-24 border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} accent={data.accent}>
          {tr(data.body)}
        </SectionHeading>
        <div className="grid gap-4 md:grid-cols-3">
          {data.principles.map((pr, i) => {
            const Icon = ICONS[pr.icon] ?? Sparkles
            return (
              <Reveal key={i} delay={i * 90} onPointerMove={trackPointer} className="spotlight rounded-3xl bg-card p-7 ring-1 ring-line ring-inset">
                <span className="grid size-11 place-items-center rounded-2xl bg-fg/[0.05] text-sky-700 ring-1 ring-line ring-inset dark:text-sky-200">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-8 text-lg font-medium text-fg">{tr(pr.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tr(pr.text)}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Méthode                                                            */
/* ------------------------------------------------------------------ */

function Method({ data }) {
  const { tr } = usePrefs()
  return (
    <section id="methode" className="relative scroll-mt-24 overflow-hidden border-t border-line py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-72 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(closest-side, var(--glow-a), transparent)' }} />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} accent={data.accent}>
          {tr(data.intro)}
        </SectionHeading>
        <ol className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <span aria-hidden="true" className="absolute top-[2.35rem] right-10 left-10 hidden h-px lg:block" style={{ backgroundImage: 'linear-gradient(to right, transparent, var(--c-line) 10%, var(--c-line) 90%, transparent)' }} />
          {data.steps.map((st, i) => {
            const Icon = ICONS[st.icon] ?? Sparkles
            return (
              <Reveal as="li" key={i} delay={i * 80} onPointerMove={trackPointer} className="spotlight relative flex flex-col rounded-3xl bg-card p-6 ring-1 ring-line ring-inset">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-bg2 text-violet-700 ring-1 ring-line ring-inset dark:text-violet-200">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-subtle">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-medium text-fg">{tr(st.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tr(st.text)}</p>
                {st.tools?.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {st.tools.map((t) => (
                      <Chip key={tr(t)}>{tr(t)}</Chip>
                    ))}
                  </div>
                )}
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Pourquoi ce profil                                                 */
/* ------------------------------------------------------------------ */

function Why({ data }) {
  const { tr } = usePrefs()
  return (
    <section id="profil" className="scroll-mt-24 border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} accent={data.accent} />
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="text-xl leading-relaxed text-pretty text-fg2">{tr(data.body)}</p>
            <div className="mt-10 border-l-2 pl-6" style={{ borderImage: 'var(--grad) 1' }}>
              <p className="font-mono text-[11px] tracking-[0.2em] text-subtle uppercase">{tr(data.originTitle)}</p>
              <p className="mt-3 leading-relaxed text-pretty text-muted">{tr(data.origin)}</p>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {data.strengths.map((s, i) => (
              <Reveal key={i} delay={(i % 2) * 90} onPointerMove={trackPointer} className="spotlight rounded-3xl bg-card p-7 ring-1 ring-line ring-inset">
                <p className="font-serif text-3xl text-fg italic">{tr(s.title)}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{tr(s.text)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Boîte à outils                                                     */
/* ------------------------------------------------------------------ */

function Skills({ data }) {
  const { tr } = usePrefs()
  return (
    <section id="outils" className="scroll-mt-24 border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} accent={data.accent} />
        <div className="grid gap-4 md:grid-cols-2">
          {data.groups.map((g, i) => (
            <Reveal key={i} delay={(i % 2) * 90} className="rounded-3xl bg-card p-7 ring-1 ring-line ring-inset">
              <h3 className="font-medium text-fg">{tr(g.title)}</h3>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {g.items.map((it) => (
                  <Chip key={tr(it)}>{tr(it)}</Chip>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
        {data.heritage?.show && data.heritage.items?.length > 0 && (
          <Reveal className="mt-4 flex flex-col gap-4 rounded-3xl border border-dashed border-line p-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="shrink-0">
              <h3 className="font-medium text-fg">{tr(data.heritage.title)}</h3>
              <p className="mt-1 text-sm text-subtle">{tr(data.heritage.note)}</p>
            </div>
            <p className="text-sm leading-relaxed text-muted sm:max-w-xl sm:text-right">{data.heritage.items.map(tr).join(' · ')}</p>
          </Reveal>
        )}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Contact + pied de page                                             */
/* ------------------------------------------------------------------ */

function Contact({ data, links }) {
  const { tr, ui } = usePrefs()
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
  const socials = [
    ...(links.socials ?? [])
      .filter((x) => x.url)
      .map((x) => ({ href: x.url, label: x.label || SOCIAL_NAMES[x.network] || x.network, Icon: SOCIAL_ICONS[x.network] ?? ArrowUpRight })),
    links.github && { href: links.github, label: 'GitHub', Icon: GithubIcon },
  ].filter(Boolean)

  return (
    <section id="contact" className="scroll-mt-24 px-5 pt-8 pb-10 sm:px-8">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-bg2 px-6 py-20 text-center ring-1 ring-line sm:px-12 sm:py-28">
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(closest-side, var(--glow-b), transparent)' }} />
          <div className="bg-gridlines absolute inset-0 bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        </div>
        <div className="relative">
          <p className="font-mono text-[11px] tracking-[0.22em] text-subtle uppercase">{tr(data.eyebrow)}</p>
          <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-medium tracking-[-0.035em] text-balance text-fg sm:text-6xl">
            {tr(data.title)} <span className="font-serif font-normal tracking-normal text-grad italic">{tr(data.accent)}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-muted">{tr(data.text)}</p>
          {links.email && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a href={`mailto:${links.email}`} className="group inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition hover:opacity-85">
                <Mail className="size-4" aria-hidden="true" /> {ui.email}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              </a>
              <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm text-fg2 ring-1 ring-line transition ring-inset hover:text-fg">
                {copied ? <Check className="size-4 text-emerald-500" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                {copied ? ui.copied : ui.copy}
              </button>
            </div>
          )}
          {socials.length > 0 && (
            <div className="mt-6 flex justify-center gap-1">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted transition hover:bg-fg/5 hover:text-fg">
                  <Icon className="size-4" /> {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  )
}

function Footer({ site, hasJournal }) {
  const { tr, ui } = usePrefs()
  const { links, identity } = site
  return (
    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p>
        © {new Date().getFullYear()} {identity.name} · {ui.rights} — {ui.footer}
      </p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {hasJournal && (
          <a href={href(paths.journal)} className="transition hover:text-fg">
            {ui.nav.journal}
          </a>
        )}
        {hasJournal && (
          <a href={href('feed.xml')} className="transition hover:text-fg">
            RSS
          </a>
        )}
        <a href={href(paths.legal)} className="transition hover:text-fg">
          {ui.legal}
        </a>
        {links.showArtstation && links.artstation && (
          <a href={links.artstation} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-fg">
            <ArtstationIcon className="size-3.5" /> {tr(links.artstationLabel) || 'ArtStation'}
          </a>
        )}
        <span>{ui.madeWith}</span>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function Site({ site, projects, posts = [], route = { page: 'home' } }) {
  const { ui } = usePrefs()
  const s = site.sections
  const journalOn = s.journal !== false
  const hasJournal = journalOn && publishedPosts(posts).length > 0
  const inJournal = journalOn && (route.page === 'journal' || route.page === 'post')
  useAnalytics(site.analytics?.goatcounter)

  let page
  if (route.page === 'journal' && journalOn) page = <JournalPage site={site} posts={posts} />
  else if (route.page === 'post' && journalOn) page = <PostPage id={route.id} site={site} posts={posts} projects={projects} />
  else if (route.page === 'legal') page = <LegalPage site={site} />
  else if (route.page === 'home')
    page = (
      <>
        <Hero site={site} projects={projects} />
        {s.manifesto && <Manifesto data={site.manifesto} />}
        {s.projects && <Projects section={site.projectsSection} projects={projects} site={site} initialOpenId={route.project} />}
        {hasJournal && site.journal.onHome !== false && <JournalSection site={site} posts={posts} />}
        {s.method && <Method data={site.method} />}
        {s.why && <Why data={site.why} />}
        {s.skills && <Skills data={site.skills} />}
        {s.contact && <Contact data={site.contact} links={site.links} />}
      </>
    )
  else page = <NotFound />

  return (
    <div className={`grain min-h-screen overflow-x-clip ${inJournal ? 'journal-space bg-bg' : ''}`}>
      <a href="#projets" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[110] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg">
        {ui.skip}
      </a>
      {inJournal ? <JournalNav site={site} /> : <Nav site={site} hasJournal={hasJournal} />}
      <main>{page}</main>
      <Footer site={site} hasJournal={hasJournal} />
    </div>
  )
}
