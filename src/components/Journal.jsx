import { useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Rss } from 'lucide-react'
import { useAsset, usePrefs } from '../lib/prefs.jsx'
import { Markdown } from '../lib/markdown.jsx'
import { href } from '../lib/route.js'
import { paths, publicUrl } from '../lib/site-url.js'
import { Comments, ShareBar } from './Social.jsx'
import { Reveal } from './ui.jsx'

export const publishedPosts = (posts) => posts.filter((p) => p.visible !== false).sort((a, b) => (a.date < b.date ? 1 : -1))

function formatDate(date, lang) {
  if (!date) return ''
  return new Date(`${date}T12:00:00`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const tagKey = (t) => (typeof t === 'string' ? t : t?.fr || t?.en || '')

/* Qui écrit : rappel discret du portfolio en bas des pages du journal */
function AuthorCard({ site }) {
  const { tr, lang } = usePrefs()
  const asset = useAsset()
  const { identity } = site
  return (
    <a href={href()} className="group flex items-center gap-4 rounded-3xl bg-card p-5 ring-1 ring-line ring-inset transition hover:ring-fg/25">
      {identity.showPhoto && identity.photo ? (
        <img src={asset(identity.photo)} alt="" className="size-14 shrink-0 rounded-2xl object-cover" />
      ) : (
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-fg/[0.06] font-serif text-2xl text-grad italic">{identity.initials}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">{lang === 'fr' ? 'Écrit par' : 'Written by'}</span>
        <span className="block font-medium text-fg">
          {identity.name} · {tr(identity.role)}
        </span>
        <span className="block text-sm text-muted">{lang === 'fr' ? 'Voir les projets sur le portfolio' : 'See the projects on the portfolio'}</span>
      </span>
      <ArrowUpRight className="size-5 shrink-0 text-muted transition group-hover:text-fg" aria-hidden="true" />
    </a>
  )
}

/* Bloc d'accueil : un simple renvoi vers le carnet, qui vit à part */
export function JournalSection({ site, posts }) {
  const { tr, lang } = usePrefs()
  const asset = useAsset()
  const list = publishedPosts(posts)
  if (!list.length) return null
  const [last, ...others] = list
  const data = site.journal
  return (
    <section id="journal" className="scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
      <Reveal className="journal-space mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-bg ring-1 ring-line">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_1fr]">
          <a href={href(paths.post(last.id))} className="group flex flex-col justify-center p-7 sm:p-10">
            <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-subtle uppercase">
              <span className="h-px w-8 bg-current opacity-50" />
              {tr(data.name) || 'Journal'} · {lang === 'fr' ? 'dernier billet' : 'latest post'}
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-[1.05] text-balance text-fg sm:text-5xl">{tr(last.title)}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">{tr(last.summary)}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-fg">
              {lang === 'fr' ? 'Lire le billet' : 'Read the post'} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </a>
          <div className="flex flex-col border-t border-line p-7 sm:p-10 lg:border-t-0 lg:border-l">
            {last.cover && <img src={asset(last.cover)} alt="" loading="lazy" className="mb-6 aspect-[16/9] w-full rounded-2xl object-cover object-top ring-1 ring-line" />}
            {others.length > 0 && (
              <ul className="space-y-3">
                {others.slice(0, last.cover ? 2 : 4).map((p) => (
                  <li key={p.id}>
                    <a href={href(paths.post(p.id))} className="group flex items-baseline gap-4">
                      <span className="shrink-0 font-mono text-[11px] text-subtle">{shortDate(p.date, lang)}</span>
                      <span className="text-fg2 group-hover:text-fg">{tr(p.title)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {!last.cover && !others.length && <p className="text-muted">{tr(data.intro)}</p>}
            <a
              href={href(paths.journal)}
              className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition hover:opacity-85 [&:not(:first-child)]:mt-8"
            >
              {lang === 'fr' ? 'Ouvrir le carnet' : 'Open the logbook'} <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function shortDate(date, lang) {
  if (!date) return ''
  return new Date(`${date}T12:00:00`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'short' })
}

function PostRow({ post, delay }) {
  const { tr, lang } = usePrefs()
  const asset = useAsset()
  return (
    <Reveal as="li" delay={delay}>
      <a href={href(paths.post(post.id))} className="group grid gap-3 border-t border-line py-8 sm:grid-cols-[9rem_1fr_10rem] sm:gap-8">
        <p className="font-mono text-[11px] tracking-wider text-subtle uppercase sm:pt-2">{formatDate(post.date, lang)}</p>
        <div>
          <h3 className="font-serif text-3xl leading-tight text-balance text-fg transition group-hover:opacity-80">{tr(post.title)}</h3>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted">{tr(post.summary)}</p>
          {post.tags?.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span key={tagKey(t)} className="rounded-full px-2.5 py-0.5 text-xs text-muted ring-1 ring-line ring-inset">
                  {tr(t)}
                </span>
              ))}
            </p>
          )}
        </div>
        {post.cover && <img src={asset(post.cover)} alt="" loading="lazy" className="hidden aspect-[4/3] w-full rounded-2xl object-cover object-top ring-1 ring-line sm:block" />}
      </a>
    </Reveal>
  )
}

/* Page /journal/ : le carnet, un espace à part entière */
export function JournalPage({ site, posts }) {
  const { tr, lang } = usePrefs()
  const asset = useAsset()
  const data = site.journal
  const all = publishedPosts(posts)
  const tags = [...new Map(all.flatMap((p) => p.tags ?? []).map((t) => [tagKey(t), t])).values()]
  const [tag, setTag] = useState('')
  const list = tag ? all.filter((p) => (p.tags ?? []).some((t) => tagKey(t) === tag)) : all
  const [featured, ...rest] = list
  const t = lang === 'fr' ? { all: 'Tout', posts: 'billets', rss: 'S’abonner (RSS)', soon: 'Premier billet très bientôt.', featured: 'À la une' } : { all: 'All', posts: 'posts', rss: 'Subscribe (RSS)', soon: 'First post coming soon.', featured: 'Featured' }

  return (
    <div className="mx-auto max-w-6xl px-5 pt-36 pb-16 sm:px-8 sm:pt-44">
      <Reveal as="header" className="border-b border-line pb-10">
        <p className="font-mono text-[11px] tracking-[0.22em] text-subtle uppercase">
          {site.identity.name} · {tr(data.eyebrow)}
        </p>
        <h1 className="mt-5 font-serif text-6xl leading-[0.95] text-fg sm:text-8xl">
          {tr(data.name) || 'Journal'}
          <span className="text-grad">.</span>
        </h1>
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl text-lg leading-relaxed text-pretty text-muted">{tr(data.intro)}</p>
          <p className="flex shrink-0 items-center gap-4 text-sm text-muted">
            <span className="font-mono text-xs">
              {all.length} {t.posts}
            </span>
            <a href={href('feed.xml')} className="inline-flex items-center gap-1.5 hover:text-fg">
              <Rss className="size-4" aria-hidden="true" /> {t.rss}
            </a>
          </p>
        </div>
        {tags.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={lang === 'fr' ? 'Thèmes' : 'Topics'}>
            {[['', t.all], ...tags.map((x) => [tagKey(x), tr(x)])].map(([k, label]) => (
              <button
                key={k || 'all'}
                type="button"
                onClick={() => setTag(k)}
                aria-pressed={tag === k}
                className={`rounded-full px-3.5 py-1.5 text-sm ring-1 ring-inset transition ${tag === k ? 'bg-fg text-bg ring-fg' : 'text-fg2 ring-line hover:ring-fg/30'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </Reveal>

      {!featured ? (
        <p className="py-16 text-muted">{t.soon}</p>
      ) : (
        <>
          <Reveal>
            <a href={href(paths.post(featured.id))} className="group grid gap-8 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              {featured.cover ? (
                <div className="overflow-hidden rounded-3xl ring-1 ring-line">
                  <img src={asset(featured.cover)} alt="" className="aspect-[1.91/1] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]" />
                </div>
              ) : (
                <div className="grid aspect-[1.91/1] place-items-center rounded-3xl bg-bg2 ring-1 ring-line">
                  <span className="font-serif text-8xl text-grad italic">{site.identity.initials}</span>
                </div>
              )}
              <div>
                <p className="font-mono text-[11px] tracking-wider text-subtle uppercase">
                  {t.featured} · {formatDate(featured.date, lang)}
                </p>
                <h2 className="mt-4 font-serif text-4xl leading-[1.05] text-balance text-fg sm:text-5xl">{tr(featured.title)}</h2>
                <p className="mt-4 text-lg leading-relaxed text-muted">{tr(featured.summary)}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-fg">
                  {lang === 'fr' ? 'Lire' : 'Read'} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </div>
            </a>
          </Reveal>
          {rest.length > 0 && (
            <ul>
              {rest.map((p, i) => (
                <PostRow key={p.id} post={p} delay={(i % 4) * 60} />
              ))}
            </ul>
          )}
        </>
      )}
      <div className="mt-12 border-t border-line pt-10">
        <AuthorCard site={site} />
      </div>
    </div>
  )
}

/* Page /journal/<id>/ */
export function PostPage({ id, site, posts, projects }) {
  const { tr, lang } = usePrefs()
  const asset = useAsset()
  const list = publishedPosts(posts)
  const post = posts.find((p) => p.id === id)
  if (!post) return <NotFound />
  const i = list.findIndex((p) => p.id === id)
  const newer = i > 0 ? list[i - 1] : null
  const older = i >= 0 && i < list.length - 1 ? list[i + 1] : null
  const project = projects.find((p) => p.id === post.project && p.visible !== false)
  const url = publicUrl(site) + paths.post(post.id)

  return (
    <article className="mx-auto max-w-3xl px-5 pt-32 pb-16 sm:px-8 sm:pt-40">
      <a href={href(paths.journal)} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden="true" /> {tr(site.journal.name) || 'Journal'}
      </a>
      {post.visible === false && (
        <p className="mt-4 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">{lang === 'fr' ? 'Brouillon' : 'Draft'}</p>
      )}
      <p className="mt-10 font-mono text-[11px] tracking-wider text-subtle uppercase">
        {formatDate(post.date, lang)}
        {post.tags?.length > 0 && ` · ${post.tags.map(tr).join(' · ')}`}
      </p>
      <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-balance text-fg sm:text-6xl">{tr(post.title)}</h1>
      {tr(post.summary) && <p className="mt-6 text-xl leading-relaxed text-pretty text-muted">{tr(post.summary)}</p>}
      {post.cover && <img src={asset(post.cover)} alt="" className="mt-10 w-full rounded-3xl ring-1 ring-line" />}
      <Markdown text={tr(post.body)} asset={asset} className="mt-10 text-[1.075rem]" />

      {project && (
        <a href={href(paths.project(project.id))} className="group mt-12 flex items-center gap-4 rounded-3xl bg-card p-5 ring-1 ring-line ring-inset hover:ring-fg/25">
          {project.images?.[0] && <img src={asset(project.images[0].src)} alt="" className="size-16 shrink-0 rounded-2xl object-cover object-top" />}
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">{lang === 'fr' ? 'Le projet' : 'The project'}</span>
            <span className="block font-medium text-fg">{project.name}</span>
            <span className="block truncate text-sm text-muted">{tr(project.hook)}</span>
          </span>
          <ArrowUpRight className="size-5 shrink-0 text-muted transition group-hover:text-fg" aria-hidden="true" />
        </a>
      )}

      <div className="mt-12 border-t border-line pt-6">
        <ShareBar url={url} title={tr(post.title)} />
      </div>
      <div className="mt-10">
        <Comments term={`journal/${post.id}`} feedback={site.feedback} email={site.links.email} />
      </div>

      {(newer || older) && (
        <nav className="mt-12 grid gap-4 sm:grid-cols-2">
          {older ? (
            <a href={href(paths.post(older.id))} className="rounded-3xl p-5 ring-1 ring-line ring-inset hover:ring-fg/25">
              <span className="text-xs text-subtle">← {lang === 'fr' ? 'Précédent' : 'Previous'}</span>
              <span className="mt-1 block font-serif text-xl text-fg">{tr(older.title)}</span>
            </a>
          ) : (
            <span />
          )}
          {newer && (
            <a href={href(paths.post(newer.id))} className="rounded-3xl p-5 text-right ring-1 ring-line ring-inset hover:ring-fg/25">
              <span className="text-xs text-subtle">{lang === 'fr' ? 'Suivant' : 'Next'} →</span>
              <span className="mt-1 block font-serif text-xl text-fg">{tr(newer.title)}</span>
            </a>
          )}
        </nav>
      )}
      <div className="mt-12">
        <AuthorCard site={site} />
      </div>
    </article>
  )
}

export function LegalPage({ site }) {
  const { tr } = usePrefs()
  return (
    <div className="mx-auto max-w-3xl px-5 pt-36 pb-24 sm:px-8 sm:pt-44">
      <h1 className="text-4xl font-medium tracking-[-0.035em] text-fg">{tr(site.legal.title)}</h1>
      <Markdown text={tr(site.legal.body)} className="mt-6" />
    </div>
  )
}

export function NotFound() {
  const { lang } = usePrefs()
  return (
    <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 pt-32 text-center">
      <div>
        <p className="font-serif text-7xl text-grad italic">404</p>
        <p className="mt-4 text-muted">{lang === 'fr' ? "Cette page n'existe pas (ou plus)." : "This page doesn't exist (anymore)."}</p>
        <a href={href()} className="mt-8 inline-flex rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg">
          {lang === 'fr' ? "Retour à l'accueil" : 'Back home'}
        </a>
      </div>
    </div>
  )
}
