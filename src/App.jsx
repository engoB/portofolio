import { Suspense, lazy, useEffect, useState } from 'react'
import site from './content/site.json'
import projects from './content/projects.json'
import { PrefsProvider } from './lib/prefs.jsx'
import Site from './components/Site.jsx'

/*
 * Tout le contenu vient de src/content/ (site.json + projects.json).
 * On le modifie depuis l'espace perso : https://engob.github.io/portofolio/#/admin
 * L'espace perso est chargé à la demande : le site public ne l'embarque pas.
 */
const Admin = lazy(() => import('./admin/Admin.jsx'))

const isAdminRoute = () => window.location.hash.startsWith('#/admin')

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute)

  useEffect(() => {
    const onHash = () => setAdmin(isAdminRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.title = admin ? `Espace perso — ${site.identity.name}` : `${site.identity.name} — ${site.identity.role.fr}`
  }, [admin])

  return (
    <PrefsProvider>
      {admin ? (
        <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted">…</div>}>
          <Admin initialSite={site} initialProjects={projects} />
        </Suspense>
      ) : (
        <Site site={site} projects={projects} />
      )}
    </PrefsProvider>
  )
}
