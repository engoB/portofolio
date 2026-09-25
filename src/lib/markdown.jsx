/*
 * Mini-Markdown sûr pour le journal et les mentions légales.
 * Gère : ## titres, paragraphes, listes (- / 1.), citations (>), **gras**, *italique*,
 * `code`, [liens](url) et ![images](chemin). Aucun HTML brut n'est interprété.
 */

const SAFE_URL = /^(https?:|mailto:|\/|#|[\w-]+[\w./-]*$)/i
const safe = (url) => (SAFE_URL.test(url.trim()) ? url.trim() : '#')

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|!\[[^\]]*\]\([^)\s]+\)|\[[^\]]+\]\([^)\s]+\))/g

function inline(text, asset, keyBase = 'i') {
  const out = []
  let last = 0
  let n = 0
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const t = m[0]
    const key = `${keyBase}-${n++}`
    if (t.startsWith('**')) out.push(<strong key={key} className="font-semibold text-fg">{inline(t.slice(2, -2), asset, key)}</strong>)
    else if (t.startsWith('`')) out.push(<code key={key} className="rounded bg-fg/[0.07] px-1.5 py-0.5 font-mono text-[0.9em]">{t.slice(1, -1)}</code>)
    else if (t.startsWith('![')) {
      const [, alt, src] = t.match(/!\[([^\]]*)\]\(([^)]+)\)/)
      out.push(<img key={key} src={asset(safe(src))} alt={alt} loading="lazy" className="my-6 w-full rounded-2xl ring-1 ring-line" />)
    } else if (t.startsWith('[')) {
      const [, label, url] = t.match(/\[([^\]]+)\]\(([^)]+)\)/)
      const u = safe(url)
      const ext = /^https?:/.test(u)
      out.push(
        <a key={key} href={u} {...(ext && { target: '_blank', rel: 'noreferrer' })} className="text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-fg">
          {inline(label, asset, key)}
        </a>,
      )
    } else out.push(<em key={key}>{inline(t.slice(1, -1), asset, key)}</em>)
    last = m.index + t.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function Markdown({ text = '', asset = (s) => s, className = '' }) {
  const lines = text.replace(/\r/g, '').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    const h = line.match(/^(#{1,3})\s+(.*)/)
    if (h) {
      const Tag = h[1].length <= 2 ? 'h2' : 'h3'
      blocks.push(
        <Tag key={i} className={Tag === 'h2' ? 'mt-10 mb-3 text-2xl font-medium tracking-tight text-fg' : 'mt-8 mb-2 text-lg font-medium text-fg'}>
          {inline(h[2], asset, `h${i}`)}
        </Tag>,
      )
      i++
      continue
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line)
      const items = []
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''))
        i++
      }
      const List = ordered ? 'ol' : 'ul'
      blocks.push(
        <List key={`l${i}`} className={`my-4 space-y-2 pl-5 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-subtle`}>
          {items.map((it, j) => (
            <li key={j}>{inline(it, asset, `l${i}-${j}`)}</li>
          ))}
        </List>,
      )
      continue
    }
    if (line.startsWith('>')) {
      const quote = []
      while (i < lines.length && lines[i].startsWith('>')) quote.push(lines[i++].replace(/^>\s?/, ''))
      blocks.push(
        <blockquote key={`q${i}`} className="my-6 border-l-2 pl-5 font-serif text-xl text-fg italic" style={{ borderImage: 'var(--grad) 1' }}>
          {inline(quote.join(' '), asset, `q${i}`)}
        </blockquote>,
      )
      continue
    }
    const para = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|>|\s*([-*]|\d+\.)\s)/.test(lines[i])) para.push(lines[i++])
    blocks.push(
      <p key={`p${i}`} className="my-4">
        {inline(para.join(' '), asset, `p${i}`)}
      </p>,
    )
  }
  return <div className={`text-[1.05rem] leading-relaxed text-fg2 ${className}`}>{blocks}</div>
}

/* Texte brut (pour résumés, flux RSS…) */
export const plain = (md = '') =>
  md
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
