/*
 * Routage minimal par chemin. Chaque page existe physiquement après le build
 * (scripts/prerender.mjs) : un lien est un simple <a href>, sans magie côté client.
 */
const BASE = import.meta.env.BASE_URL

export const href = (path = '') => `${BASE}${path}`

export function currentRoute() {
  let p = window.location.pathname
  if (p.startsWith(BASE)) p = p.slice(BASE.length)
  const parts = p.split('/').filter(Boolean).map(decodeURIComponent)
  if (parts[0] === 'journal') return parts[1] ? { page: 'post', id: parts[1] } : { page: 'journal' }
  if (parts[0] === 'projets' && parts[1]) return { page: 'home', project: parts[1] }
  if (parts[0] === 'mentions-legales') return { page: 'legal' }
  if (parts.length && parts[0] !== 'index.html') return { page: '404' }
  return { page: 'home' }
}
