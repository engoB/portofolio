/*
 * Adresse publique du site, partagée par l'application et le script de prérendu.
 * - Sans domaine : https://<compte>.github.io/<dépôt>/
 * - Avec domaine (site.json → "domain") : https://<domaine>/
 */
export function publicUrl(site) {
  if (site.domain) return `https://${site.domain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/`
  return `https://${site.repo.owner.toLowerCase()}.github.io/${site.repo.name}/`
}

/* Chemins des pages (relatifs à la racine du site) */
export const paths = {
  home: '',
  journal: 'journal/',
  post: (id) => `journal/${id}/`,
  project: (id) => `projets/${id}/`,
  legal: 'mentions-legales/',
}
