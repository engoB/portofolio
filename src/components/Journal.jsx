import { ArrowLeft, ArrowRight, ArrowUpRight, Rss } from 'lucide-react'
import { useAsset, usePrefs } from '../lib/prefs.jsx'
import { Markdown } from '../lib/markdown.jsx'
import { href } from '../lib/route.js'
import { paths, publicUrl } from '../lib/site-url.js'
import { Comments, ShareBar } from './Social.jsx'
import { Reveal, SectionHeading } from './ui.jsx'

export const publishedPosts = (posts) => posts.filter((p) => p.visible !== false).sort((a, b) => (a.date < b.date ? 1 : -1))

function formatDate(date, lang) {
  if (!date) return ''
  return new Date(`${date}T12:00:00`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function PostCard({ post, delay = 0 }) {
  const { tr, lang } = usePrefs()
  const asset = useAsset()
  return (
    <Reveal as="article" delay={delay} className="group overflow-hidden rounded-3xl bg-card ring-1 ring-line transition ring-inset hover:ring-fg/25">
      <a href={href(paths.post(post.id))} className="flex h-full flex-col">
        {post.cover && (
          <div className="aspect-[16/9] overflow-hidden border-b border-line bg-bg2">
            <img src={asset(post.cover)} alt="" loading="lazy" className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          <p className="font-mono text-[11px] tracking-wider text-subtle uppercase">
            {formatDate(post.date, lang)}
            {post.tags?.length > 0 && ` · ${post.tags.slice(0, 2).map(tr).join(' · ')}`}
          </p>
          <h3 className="mt-3 text-xl font-medium tracking-tight text-balance text-fg">{tr(post.title)}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{tr(post.summary)}</p>
          <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm text-fg">
            {lang === 'fr' ? 'Lire' : 'Read'} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </a>
    </Reveal>
  )
}

/* Bloc « Journal » de la page d'accueil : les 3 derniers billets */
export function JournalSection({ data, posts }) {
  const { tr, lang } = usePrefs()
  const list = publishedPosts(posts).slice(0, 3)
  if (!list.length) return null
  return (
    <section id="journal" className="scroll-mt-24 border-t border-line py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow={data.eyebrow} title={data.title} accent={data.accent} className="!mb-0">
            {tr(data.intro)}
          </SectionHeading>
          <a href={href(paths.journal)} className="inline-flex items-center gap-1.5 self-start rounded-full px-5 py-2.5 text-sm text-fg2 ring-1 ring-line ring-inset hover:text-fg lg:self-auto">
            {lang === 'fr' ? 'Tout le journal' : 'All posts'} <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {list.map((p, i) => (
            <PostCard key={p.id} post={p} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* Page /journal/ */
export function JournalPage({ data, posts }) {
  const { tr, lang } = usePrefs()
  const list = publishedPosts(posts)
  return (
    <div className="mx-auto max-w-7xl px-5 pt-36 pb-24 sm:px-8 sm:pt-44">
      <SectionHeading eyebrow={data.eyebrow} title={data.title} accent={data.accent}>
        {tr(data.intro)}
      </SectionHeading>
      <a href={href('feed.xml')} className="-mt-6 mb-12 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <Rss className="size-4" aria-hidden="true" /> {lang === 'fr' ? 'Suivre via le flux RSS' : 'Follow via RSS'}
      </a>
      {list.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <PostCard key={p.id} post={p} delay={(i % 3) * 80} />
          ))}
        </div>
      ) : (
        <p className="text-muted">{lang === 'fr' ? 'Premier billet très bientôt.' : 'First post coming soon.'}</p>
      )}
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
    <article className="mx-auto max-w-3xl px-5 pt-32 pb-24 sm:px-8 sm:pt-40">
      <a href={href(paths.journal)} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden="true" /> {lang === 'fr' ? 'Journal' : 'Journal'}
      </a>
      {post.visible === false && (
        <p className="mt-4 inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-700 dark:text-amber-300">{lang === 'fr' ? 'Brouillon' : 'Draft'}</p>
      )}
      <p className="mt-8 font-mono text-[11px] tracking-wider text-subtle uppercase">
        {formatDate(post.date, lang)}
        {post.tags?.length > 0 && ` · ${post.tags.map(tr).join(' · ')}`}
      </p>
      <h1 className="mt-4 text-4xl font-medium tracking-[-0.035em] text-balance text-fg sm:text-5xl">{tr(post.title)}</h1>
      {tr(post.summary) && <p className="mt-5 text-xl leading-relaxed text-pretty text-muted">{tr(post.summary)}</p>}
      {post.cover && <img src={asset(post.cover)} alt="" className="mt-10 w-full rounded-3xl ring-1 ring-line" />}
      <Markdown text={tr(post.body)} asset={asset} className="mt-8" />

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
              <span className="mt-1 block font-medium text-fg">{tr(older.title)}</span>
            </a>
          ) : (
            <span />
          )}
          {newer && (
            <a href={href(paths.post(newer.id))} className="rounded-3xl p-5 text-right ring-1 ring-line ring-inset hover:ring-fg/25">
              <span className="text-xs text-subtle">{lang === 'fr' ? 'Suivant' : 'Next'} →</span>
              <span className="mt-1 block font-medium text-fg">{tr(newer.title)}</span>
            </a>
          )}
        </nav>
      )}
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
