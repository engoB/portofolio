import { useEffect, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import { ArrowUpRight, Smartphone, X } from 'lucide-react'
import { usePrefs } from '../lib/prefs.jsx'

/*
 * Projets pensés pour le téléphone (PWA) : sur un ordinateur, le lien de démo ouvre
 * l'application dans un cadre de téléphone, avec un QR code pour la tester sur un vrai mobile.
 * Aucun projet n'est modifié : c'est le portfolio qui fournit le cadre.
 */

const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches

function QrCode({ url, className = '' }) {
  const qr = qrcode(0, 'M')
  qr.addData(url)
  qr.make()
  const n = qr.getModuleCount()
  let d = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className={className} role="img" aria-label="QR code" shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
      <path d={d} fill="#0b0b0f" />
    </svg>
  )
}

function PhoneDialog({ p, onClose }) {
  const { tr, lang } = usePrefs()
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    d?.showModal()
    const close = () => onClose()
    d?.addEventListener('close', close)
    return () => d?.removeEventListener('close', close)
  }, [onClose])
  const t =
    lang === 'fr'
      ? { title: 'Pensé pour le téléphone', text: "Cette application est conçue pour un écran de téléphone : c'est là qu'elle est la plus agréable. Essayez-la ici, ou scannez le QR code pour l'ouvrir sur votre mobile.", full: 'Ouvrir en plein écran', close: 'Fermer' }
      : { title: 'Designed for phones', text: "This app is designed for a phone screen, where it feels best. Try it here, or scan the QR code to open it on your phone.", full: 'Open full screen', close: 'Close' }
  return (
    <dialog
      ref={ref}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      aria-label={`${p.name} — ${t.title}`}
    >
      <div className="flex h-full items-center justify-center gap-12 p-6" onClick={(e) => e.target === e.currentTarget && ref.current.close()}>
        <div className="relative h-[min(844px,calc(100dvh-48px))] shrink-0" style={{ aspectRatio: '390 / 844' }}>
          <div className="absolute inset-0 rounded-[3rem] bg-zinc-900 p-3 shadow-2xl ring-1 shadow-black/60 ring-white/15">
            <iframe
              src={p.demo}
              title={p.name}
              allow="geolocation; clipboard-write; fullscreen; web-share"
              className="size-full rounded-[2.4rem] bg-white"
            />
          </div>
        </div>
        <aside className="w-72 text-white">
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
            <Smartphone className="size-3.5" aria-hidden="true" /> {t.title}
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight">{p.name}</h2>
          <p className="mt-1 font-serif text-xl text-white/80 italic">{tr(p.hook)}</p>
          <p className="mt-5 text-sm leading-relaxed text-white/70">{t.text}</p>
          <QrCode url={p.demo} className="mt-6 w-40 rounded-xl" />
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={p.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:opacity-85">
              {t.full} <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
            <button type="button" onClick={() => ref.current.close()} className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm text-white/80 ring-1 ring-white/25 hover:text-white">
              <X className="size-4" aria-hidden="true" /> {t.close}
            </button>
          </div>
        </aside>
      </div>
    </dialog>
  )
}

/* Lien de démo : ouvre le cadre téléphone sur ordinateur pour les projets « mobile d'abord » */
export function DemoLink({ p, className, children }) {
  const [open, setOpen] = useState(false)
  const onClick = (e) => {
    if (!p.mobileFirst || !isDesktop()) return
    e.preventDefault()
    setOpen(true)
  }
  return (
    <>
      <a href={p.demo} target="_blank" rel="noreferrer" onClick={onClick} className={className}>
        {children}
      </a>
      {open && <PhoneDialog p={p} onClose={() => setOpen(false)} />}
    </>
  )
}

/* Pastille « à tester sur mobile » */
export function MobileHint({ p, className = '' }) {
  const { lang } = usePrefs()
  if (!p.mobileFirst) return null
  return (
    <p className={`flex items-center gap-1.5 text-xs text-subtle ${className}`}>
      <Smartphone className="size-3.5 shrink-0" aria-hidden="true" />
      {lang === 'fr' ? 'Pensé pour le téléphone : à essayer sur mobile.' : 'Designed for phones: best tried on mobile.'}
    </p>
  )
}
