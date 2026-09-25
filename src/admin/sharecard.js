/*
 * Génère dans le navigateur une image de partage 1200 × 630 (JPEG) pour un projet
 * ou un billet : titre, accroche, capture. Publiée dans public/og/<id>.jpg, elle est
 * utilisée par LinkedIn, X, etc. quand on partage l'adresse de la page.
 */
const W = 1200
const H = 630

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })

function wrap(ctx, text, maxWidth) {
  const words = text.split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function makeShareCard({ kicker, title, subtitle, image, kind = 'desktop', accent = '#7dd3fc', footer }) {
  await document.fonts?.ready
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#07070a'
  ctx.fillRect(0, 0, W, H)
  let g = ctx.createRadialGradient(W * 0.8, H * 1.1, 0, W * 0.8, H * 1.1, 620)
  g.addColorStop(0, `${accent}77`)
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  g = ctx.createRadialGradient(W * 0.2, -60, 0, W * 0.2, -60, 520)
  g.addColorStop(0, 'rgba(99,102,241,0.3)')
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  const img = await loadImage(image)
  const mobile = kind === 'mobile'
  const textW = img ? (mobile ? 680 : 540) : 1000

  if (img) {
    ctx.save()
    if (mobile) {
      const w = 250
      const h = w * (844 / 390)
      ctx.translate(W - 90 - w / 2, 70 + h / 2)
      ctx.rotate((3 * Math.PI) / 180)
      ctx.shadowColor = 'rgba(0,0,0,.6)'
      ctx.shadowBlur = 60
      roundRect(ctx, -w / 2, -h / 2, w, h, 38)
      ctx.fillStyle = '#18181b'
      ctx.fill()
      ctx.shadowBlur = 0
      roundRect(ctx, -w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 31)
      ctx.clip()
      const s = (w - 16) / img.width
      ctx.drawImage(img, -w / 2 + 8, -h / 2 + 8, w - 16, img.height * s)
    } else {
      const x = 660
      const y = 120
      const w = 640
      const h = w * (10 / 16) + 28
      ctx.shadowColor = 'rgba(0,0,0,.6)'
      ctx.shadowBlur = 60
      roundRect(ctx, x, y, w, h, 14)
      ctx.fillStyle = '#27272a'
      ctx.fill()
      ctx.shadowBlur = 0
      roundRect(ctx, x, y, w, h, 14)
      ctx.clip()
      const s = w / img.width
      ctx.drawImage(img, x, y + 28, w, img.height * s)
    }
    ctx.restore()
  }

  ctx.fillStyle = '#a1a1aa'
  ctx.font = '15px "Geist Mono", monospace'
  ctx.fillText((kicker || '').toUpperCase().split('').join(String.fromCharCode(8202)), 72, 98)

  ctx.fillStyle = '#ffffff'
  ctx.font = '500 58px Geist, system-ui, sans-serif'
  let y = 170
  for (const l of wrap(ctx, title || '', textW).slice(0, 3)) {
    ctx.fillText(l, 72, y)
    y += 64
  }

  if (subtitle) {
    const grad = ctx.createLinearGradient(72, 0, 72 + textW, 0)
    grad.addColorStop(0, '#c7d2fe')
    grad.addColorStop(0.5, '#7dd3fc')
    grad.addColorStop(1, '#a7f3d0')
    ctx.fillStyle = grad
    ctx.font = 'italic 34px "Instrument Serif", Georgia, serif'
    y += 6
    for (const l of wrap(ctx, subtitle, textW).slice(0, 3)) {
      ctx.fillText(l, 72, y)
      y += 42
    }
  }

  ctx.fillStyle = '#71717a'
  ctx.font = '15px "Geist Mono", monospace'
  ctx.fillText(footer || '', 72, H - 56)

  return c.toDataURL('image/jpeg', 0.86)
}
