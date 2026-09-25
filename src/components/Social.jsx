import { useEffect, useRef, useState } from 'react'
import { AtSign, Check, Link2, Mail, MessageCircle, Share2 } from 'lucide-react'
import { usePrefs } from '../lib/prefs.jsx'
import { LinkedinIcon } from './ui.jsx'

/* ------------------------------------------------------------------ */
/* Partage                                                            */
/* ------------------------------------------------------------------ */

function XIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  )
}

function BlueskyIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M5.2 3.3C7.9 5.4 10.9 9.5 12 11.8c1.1-2.3 4.1-6.4 6.8-8.5 2-1.5 5.2-2.6 5.2 1 0 .7-.4 6-.7 6.9-.9 3.1-4.1 3.9-7 3.4 5 .9 6.3 3.7 3.5 6.5-5.2 5.4-7.5-1.4-8.1-3.1l-.2-.5-.2.5c-.6 1.7-2.9 8.5-8.1 3.1-2.8-2.8-1.5-5.6 3.5-6.5-2.9.5-6.1-.3-7-3.4C.4 10.3 0 5 0 4.3c0-3.6 3.2-2.5 5.2-1Z" />
    </svg>
  )
}

export function InstagramIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 22v-8.2h2.8l.4-3.3h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.3h2.8V22h3.4Z" />
    </svg>
  )
}

function WhatsappIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M3.5 20.5 4.8 16A8.5 8.5 0 1 1 8 19.3l-4.5 1.2Z" />
      <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4.5 4.5 0 0 1-2.3-2.3l.8-1-1-2L9 8.5Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ThreadsIcon({ className = 'size-4' }) {
  return <AtSign className={className} aria-hidden="true" />
}

function TiktokIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.2 2.5c.3 2.4 1.8 4 4.3 4.2v3.4c-1.6 0-3-.5-4.2-1.3v6.4a5.8 5.8 0 1 1-5.8-5.8h.4v3.5h-.4a2.3 2.3 0 1 0 2.3 2.3V2.5h3.4Z" />
    </svg>
  )
}

function YoutubeIcon({ className = 'size-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path fillRule="evenodd" d="M6 4.5h12a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Zm4 4.5v6l5.2-3L10 9Z" />
    </svg>
  )
}

export const SOCIAL_ICONS = {
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  threads: ThreadsIcon,
  facebook: FacebookIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  x: XIcon,
  bluesky: BlueskyIcon,
}
export const SOCIAL_NAMES = {
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  threads: 'Threads',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  bluesky: 'Bluesky',
}

export function ShareBar({ url, title }) {
  const { lang } = usePrefs()
  const [copied, setCopied] = useState(false)
  const t =
    lang === 'fr'
      ? { share: 'Partager', copy: 'Copier le lien', copied: 'Lien copié', native: 'Partager… (Instagram, messages…)' }
      : { share: 'Share', copy: 'Copy link', copied: 'Link copied', native: 'Share… (Instagram, messages…)' }
  const u = encodeURIComponent(url)
  const txt = encodeURIComponent(title)
  const targets = [
    { label: 'LinkedIn', Icon: LinkedinIcon, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: 'Facebook', Icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: 'Threads', Icon: ThreadsIcon, href: `https://www.threads.net/intent/post?text=${txt}%20${u}` },
    { label: 'WhatsApp', Icon: WhatsappIcon, href: `https://wa.me/?text=${txt}%20${u}` },
    { label: 'X', Icon: XIcon, href: `https://twitter.com/intent/tweet?url=${u}&text=${txt}` },
    { label: 'Bluesky', Icon: BlueskyIcon, href: `https://bsky.app/intent/compose?text=${txt}%20${u}` },
  ]
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt(t.copy, url)
    }
  }
  const native = typeof navigator !== 'undefined' && navigator.share
  const btn = 'grid size-9 place-items-center rounded-full text-muted ring-1 ring-line transition ring-inset hover:text-fg hover:ring-fg/30'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-[10px] tracking-[0.2em] text-subtle uppercase">{t.share}</span>
      {targets.map(({ label, Icon, href }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`${t.share} — ${label}`} title={label} className={btn}>
          <Icon className="size-3.5" />
        </a>
      ))}
      <button type="button" onClick={copy} aria-label={t.copy} title={copied ? t.copied : t.copy} className={btn}>
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Link2 className="size-3.5" />}
      </button>
      {native && (
        <button
          type="button"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
          title={t.native}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-fg px-3.5 text-sm font-medium text-bg transition hover:opacity-85"
        >
          <Share2 className="size-3.5" aria-hidden="true" /> {t.share}…
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Retours des visiteurs : Giscus (GitHub Discussions)                */
/* ------------------------------------------------------------------ */

export function Comments({ term, feedback, email }) {
  const { lang, dark } = usePrefs()
  const box = useRef(null)
  const ready = feedback?.enabled && feedback.repo && feedback.repoId && feedback.categoryId
  const t =
    lang === 'fr'
      ? { title: 'Vos retours', hint: 'Une critique, une idée, un encouragement ? Tout est bon à prendre.', mail: 'Me répondre par email' }
      : { title: 'Your feedback', hint: 'A critique, an idea, some encouragement? It all helps.', mail: 'Reply by email' }

  useEffect(() => {
    const el = box.current
    if (!ready || !el) return
    el.innerHTML = ''
    const s = document.createElement('script')
    Object.entries({
      src: 'https://giscus.app/client.js',
      'data-repo': feedback.repo,
      'data-repo-id': feedback.repoId,
      'data-category': feedback.category,
      'data-category-id': feedback.categoryId,
      'data-mapping': 'specific',
      'data-term': term,
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': dark ? 'transparent_dark' : 'light',
      'data-lang': lang,
      'data-loading': 'lazy',
      crossorigin: 'anonymous',
    }).forEach(([k, v]) => s.setAttribute(k, v))
    s.async = true
    el.appendChild(s)
  }, [ready, term, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Changement de thème sans recharger les commentaires */
  useEffect(() => {
    const frame = box.current?.querySelector('iframe.giscus-frame')
    frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: dark ? 'transparent_dark' : 'light' } } }, 'https://giscus.app')
  }, [dark])

  return (
    <section className="rounded-3xl bg-card p-6 ring-1 ring-line ring-inset sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-medium text-fg">
            <MessageCircle className="size-4" aria-hidden="true" /> {t.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{t.hint}</p>
        </div>
        {email && (
          <a href={`mailto:${email}?subject=${encodeURIComponent(term)}`} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-fg2 ring-1 ring-line ring-inset hover:text-fg">
            <Mail className="size-4" aria-hidden="true" /> {t.mail}
          </a>
        )}
      </div>
      {ready && <div ref={box} className="mt-6 min-h-24" />}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Mesure d'audience : GoatCounter (sans cookie)                       */
/* ------------------------------------------------------------------ */

export function useAnalytics(code) {
  useEffect(() => {
    if (!code || document.querySelector('script[data-goatcounter]')) return
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://gc.zgo.at/count.js'
    s.dataset.goatcounter = `https://${code}.goatcounter.com/count`
    document.head.appendChild(s)
  }, [code])
}

/* Compte l'ouverture d'une fiche projet comme une page vue */
export const trackView = (path, title) => {
  try {
    window.goatcounter?.count?.({ path, title })
  } catch {
    /* mesure indisponible : sans conséquence */
  }
}
