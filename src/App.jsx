import { Suspense, lazy, useEffect, useState } from 'react'
import site from './content/site.json'
import projects from './content/projects.json'
import posts from './content/posts.json'
import { PrefsProvider } from './lib/prefs.jsx'
import { currentRoute } from './lib/route.js'
import Site from './components/Site.jsx'

/*
 * Tout le contenu vient de src/content/ (site.json, projects.json, posts.json).
 * On le modifie depuis l'espace perso : <adresse du site>/#/admin
 * L'espace perso est chargé à la demande : le site public ne l'embarque pas.
 */
const Admin = lazy(() => import('./admin/Admin.jsx'))

const isAdminRoute = () => window.location.hash.startsWith('#/admin')

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute)
  const [route] = useState(currentRoute)

  useEffect(() => {
    const onHash = () => setAdmin(isAdminRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (admin) document.title = `Espace perso — ${site.identity.name}`
  }, [admin])

  return (
    <PrefsProvider>
      {admin ? (
        <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted">…</div>}>
          <Admin initialSite={site} initialProjects={projects} initialPosts={posts} />
        </Suspense>
      ) : (
        <Site site={site} projects={projects} posts={posts} route={route} />
      )}
    </PrefsProvider>
  )
}
