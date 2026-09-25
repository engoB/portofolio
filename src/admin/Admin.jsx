import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, BarChart3, Check, Download, Eye, KeyRound, Loader2, LogOut, Moon, PenLine, Sun, TriangleAlert, UploadCloud, X } from 'lucide-react'
import { AssetContext, usePrefs } from '../lib/prefs.jsx'
import Site from '../components/Site.jsx'
import { createClient } from './github.js'
import { inputCls, setIn } from './fields.jsx'
import { ProfileEditor, ProjectsEditor, TextsEditor } from './editors.jsx'
import { JournalEditor, SettingsEditor } from './editors2.jsx'

const SITE_PATH = 'src/content/site.json'
const PROJECTS_PATH = 'src/content/projects.json'
const POSTS_PATH = 'src/content/posts.json'
const TOKEN_KEY = 'pf_admin_token'

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}
const storeToken = (token, remember) => {
  try {
    ;(remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
  } catch {
    /* stockage indisponible : le jeton reste en mémoire pour la session */
  }
}
const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* rien à nettoyer */
  }
}

const json = (v) => `${JSON.stringify(v, null, 2)}\n`

const download = (name, text) => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

/* Chemins d'images réellement utilisés par le contenu (pour ne publier que ceux-là).
   Les cartes de partage (og/…) sont toujours publiées. */
const usedPaths = (site, projects, posts) =>
  new Set([
    site.identity.photo,
    ...projects.flatMap((p) => (p.images ?? []).map((i) => i.src)),
    ...posts.flatMap((p) => [p.cover, ...[...JSON.stringify(p.body ?? '').matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)].map((m) => m[1])]),
  ])

/* ------------------------------------------------------------------ */
/* Connexion                                                          */
/* ------------------------------------------------------------------ */

function Login({ repo, onToken, onLocal, error, busy }) {
  const [token, setToken] = useState('')
  const [remember, setRemember] = useState(true)
  const newTokenUrl = 'https://github.com/settings/personal-access-tokens/new'
  return (
    <div className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-lg">
        <p className="font-mono text-[11px] tracking-[0.22em] text-subtle uppercase">Espace perso</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-fg">Modifier le site à la volée</h1>
        <p className="mt-3 text-muted">
          Textes, photos, projets affichés ou masqués, statuts : tout se règle ici, puis se publie en un clic. Le site se met à jour environ une minute après.
        </p>

        <form
          className="mt-8 space-y-4 rounded-3xl bg-card p-6 ring-1 ring-line ring-inset"
          onSubmit={(e) => {
            e.preventDefault()
            if (token.trim()) onToken(token.trim(), remember)
          }}
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-fg2">Jeton d'accès GitHub</span>
            <input className={inputCls} type="password" autoComplete="off" placeholder="github_pat_…" value={token} onChange={(e) => setToken(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm text-fg2">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-4 accent-emerald-500" />
            Se souvenir de moi sur cet appareil
          </label>
          {error && (
            <p className="flex gap-2 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}
          <button type="submit" disabled={busy || !token.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg disabled:opacity-50">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Se connecter
          </button>
        </form>

        <details className="mt-4 rounded-3xl bg-card p-6 text-sm text-muted ring-1 ring-line ring-inset">
          <summary className="cursor-pointer font-medium text-fg">Créer mon jeton (une seule fois, 2 minutes)</summary>
          <ol className="mt-4 list-decimal space-y-2 pl-5">
            <li>
              Ouvrez{' '}
              <a className="text-sky-600 underline dark:text-sky-300" href={newTokenUrl} target="_blank" rel="noreferrer">
                GitHub → Fine-grained token
              </a>
              .
            </li>
            <li>Nom : « Portfolio — espace perso ». Expiration : 90 jours (ou plus).</li>
            <li>
              <b className="text-fg2">Repository access</b> → <i>Only select repositories</i> → <code className="text-fg2">{repo.owner}/{repo.name}</code>.
            </li>
            <li>
              <b className="text-fg2">Permissions</b> → <i>Contents</i> → <b className="text-fg2">Read and write</b>. Rien d'autre.
            </li>
            <li>Générez, copiez le jeton et collez-le ci-dessus.</li>
          </ol>
          <p className="mt-4">Le jeton reste dans ce navigateur et n'est envoyé qu'à GitHub. Ne le partagez jamais.</p>
        </details>

        <button type="button" onClick={onLocal} className="mt-4 text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
          Essayer sans jeton (modifications et aperçu, sans publication)
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Espace perso                                                       */
/* ------------------------------------------------------------------ */

const TABS = [
  { id: 'projects', label: 'Projets' },
  { id: 'journal', label: 'Journal' },
  { id: 'texts', label: 'Textes' },
  { id: 'profile', label: 'Profil' },
  { id: 'settings', label: 'Réglages' },
]

export default function Admin({ initialSite, initialProjects, initialPosts = [] }) {
  const { dark, toggleTheme } = usePrefs()
  const repo = initialSite.repo
  const [token, setToken] = useState(readToken)
  const [mode, setMode] = useState(token ? 'connecting' : 'login') // login | connecting | ready | local
  const [error, setError] = useState('')
  const [base, setBase] = useState({ site: initialSite, projects: initialProjects, posts: initialPosts })
  const [draft, setDraft] = useState(base)
  const [uploads, setUploads] = useState({}) // chemin (dans public/) → data URL
  const [published, setPublished] = useState(() => new Set())
  const [tab, setTab] = useState('projects')
  const [preview, setPreview] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [notice, setNotice] = useState(null)

  const client = useMemo(() => (token ? createClient({ token, ...repo }) : null), [token, repo])

  /* Connexion + chargement du contenu le plus récent depuis GitHub */
  const connect = useCallback(
    async (c) => {
      setMode('connecting')
      setError('')
      try {
        await c.check()
        const [site, projects, posts] = await Promise.all([
          c.readJson(SITE_PATH),
          c.readJson(PROJECTS_PATH),
          c.readJson(POSTS_PATH).catch((e) => (e.status === 404 ? [] : Promise.reject(e))),
        ])
        setBase({ site, projects, posts })
        setDraft({ site, projects, posts })
        setMode('ready')
      } catch (e) {
        setError(e.status === 401 ? 'Jeton refusé par GitHub (expiré ou mal copié).' : e.message)
        setMode('login')
      }
    },
    [],
  )

  useEffect(() => {
    if (client && mode === 'connecting') connect(client)
  }, [client]) // eslint-disable-line react-hooks/exhaustive-deps

  const onToken = (t, remember) => {
    storeToken(t, remember)
    setToken(t)
    setMode('connecting')
  }
  const logout = () => {
    clearToken()
    setToken('')
    setMode('login')
  }

  const addUpload = useCallback((path, dataUrl) => setUploads((u) => ({ ...u, [path]: dataUrl })), [])
  const updateSite = useCallback((path, value) => setDraft((d) => ({ ...d, site: setIn(d.site, path, value) })), [])
  const setProjects = useCallback((projects) => setDraft((d) => ({ ...d, projects })), [])
  const setPosts = useCallback((posts) => setDraft((d) => ({ ...d, posts })), [])
  const listRepos = useCallback(() => (client ? client.listRepos() : createClient({ token: '', ...repo }).listRepos()), [client, repo])

  const siteChanged = json(draft.site) !== json(base.site)
  const projectsChanged = json(draft.projects) !== json(base.projects)
  const postsChanged = json(draft.posts) !== json(base.posts)
  const used = usedPaths(draft.site, draft.projects, draft.posts)
  const newImages = Object.keys(uploads).filter((p) => (used.has(p) || p.startsWith('og/')) && !published.has(p))
  const changes = Number(siteChanged) + Number(projectsChanged) + Number(postsChanged) + newImages.length

  /* Prévenir avant de quitter avec des modifications non publiées */
  useEffect(() => {
    if (!changes) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [changes])

  const publish = async () => {
    if (!client || !changes) return
    setPublishing(true)
    setNotice(null)
    try {
      // Si le contenu a été modifié ailleurs entre-temps, on demande confirmation
      const [rSite, rProjects, rPosts] = await Promise.all([
        client.readJson(SITE_PATH),
        client.readJson(PROJECTS_PATH),
        client.readJson(POSTS_PATH).catch(() => base.posts),
      ])
      if ((json(rSite) !== json(base.site) || json(rProjects) !== json(base.projects) || json(rPosts) !== json(base.posts)) && !confirm('Le contenu a été modifié ailleurs depuis votre connexion. Publier quand même et remplacer ces changements ?')) {
        setPublishing(false)
        return
      }
      const files = []
      if (siteChanged) files.push({ path: SITE_PATH, text: json(draft.site) })
      if (projectsChanged) files.push({ path: PROJECTS_PATH, text: json(draft.projects) })
      if (postsChanged) files.push({ path: POSTS_PATH, text: json(draft.posts) })
      for (const p of newImages) files.push({ path: `public/${p}`, base64: uploads[p].split(',')[1] })
      await client.commit(files, `Espace perso : mise à jour du contenu (${files.length} fichier${files.length > 1 ? 's' : ''})`)
      setBase(draft)
      setPublished((s) => new Set([...s, ...newImages]))
      setNotice({ ok: true, text: 'Publié. Le site sera à jour dans une minute environ.' })
    } catch (e) {
      setNotice({ ok: false, text: e.message })
    } finally {
      setPublishing(false)
    }
  }

  if (mode === 'login' || mode === 'connecting') {
    return <Login repo={repo} busy={mode === 'connecting'} error={error} onToken={onToken} onLocal={() => setMode('local')} />
  }

  const actionsUrl = `https://github.com/${repo.owner}/${repo.name}/actions`
  const siteUrl = `https://${repo.owner.toLowerCase()}.github.io/${repo.name}/`

  return (
    <AssetContext.Provider value={uploads}>
      {preview ? (
        <>
          <Site site={draft.site} projects={draft.projects} posts={draft.posts} />
          <div className="fixed bottom-5 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-full bg-fg p-1.5 pl-4 text-sm text-bg shadow-2xl">
            Aperçu {changes ? '(non publié)' : ''}
            <button type="button" onClick={() => setPreview(false)} className="inline-flex items-center gap-1.5 rounded-full bg-bg px-4 py-2 font-medium text-fg">
              <PenLine className="size-4" /> Retour à l'édition
            </button>
          </div>
        </>
      ) : (
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3 sm:px-8">
              <span className="mr-2 text-sm font-medium text-fg">Espace perso</span>
              <nav className="flex gap-1 rounded-full bg-card p-1 ring-1 ring-line ring-inset">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition ${tab === t.id ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
              <div className="ml-auto flex items-center gap-1.5">
                <button type="button" onClick={toggleTheme} className="grid size-9 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg" aria-label="Thème">
                  {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </button>
                {draft.site.analytics?.goatcounter && (
                  <a
                    href={`https://${draft.site.analytics.goatcounter}.goatcounter.com`}
                    target="_blank"
                    rel="noreferrer"
                    title="Statistiques de visite"
                    className="grid size-9 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg"
                  >
                    <BarChart3 className="size-4" />
                  </a>
                )}
                <button type="button" onClick={() => setPreview(true)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-fg2 ring-1 ring-line ring-inset hover:text-fg">
                  <Eye className="size-4" /> Aperçu
                </button>
                {mode === 'ready' ? (
                  <>
                    <button
                      type="button"
                      onClick={publish}
                      disabled={!changes || publishing}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:bg-fg/15 disabled:text-subtle"
                    >
                      {publishing ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                      Publier{changes ? ` (${changes})` : ''}
                    </button>
                    <button type="button" onClick={logout} className="grid size-9 place-items-center rounded-full text-muted hover:bg-fg/5 hover:text-fg" aria-label="Se déconnecter" title="Se déconnecter">
                      <LogOut className="size-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      download('site.json', json(draft.site))
                      download('projects.json', json(draft.projects))
                      download('posts.json', json(draft.posts))
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg"
                  >
                    <Download className="size-4" /> Télécharger les JSON
                  </button>
                )}
              </div>
            </div>
          </header>

          {mode === 'local' && (
            <p className="mx-auto mt-4 max-w-7xl px-5 text-sm text-amber-700 sm:px-8 dark:text-amber-300">
              Mode essai sans jeton : vos modifications restent dans cet onglet. Connectez-vous pour publier.{' '}
              <button type="button" className="underline" onClick={() => setMode('login')}>
                Se connecter
              </button>
            </p>
          )}

          {notice && (
            <div className={`mx-auto mt-4 flex max-w-7xl items-start gap-2 px-5 text-sm sm:px-8 ${notice.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
              {notice.ok ? <Check className="mt-0.5 size-4 shrink-0" /> : <TriangleAlert className="mt-0.5 size-4 shrink-0" />}
              <span>
                {notice.text}{' '}
                {notice.ok && (
                  <>
                    <a className="underline" href={actionsUrl} target="_blank" rel="noreferrer">
                      Suivre le déploiement
                    </a>{' '}
                    ·{' '}
                    <a className="inline-flex items-center gap-0.5 underline" href={siteUrl} target="_blank" rel="noreferrer">
                      Voir le site <ArrowUpRight className="size-3" />
                    </a>
                  </>
                )}
              </span>
              <button type="button" onClick={() => setNotice(null)} className="ml-auto" aria-label="Fermer">
                <X className="size-4" />
              </button>
            </div>
          )}

          <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
            {tab === 'projects' && <ProjectsEditor projects={draft.projects} onChange={setProjects} addUpload={addUpload} listRepos={listRepos} site={draft.site} />}
            {tab === 'journal' && <JournalEditor posts={draft.posts} onChange={setPosts} projects={draft.projects} site={draft.site} addUpload={addUpload} />}
            {tab === 'settings' && <SettingsEditor site={draft.site} update={updateSite} />}
            {tab === 'texts' && <TextsEditor site={draft.site} update={updateSite} />}
            {tab === 'profile' && <ProfileEditor site={draft.site} update={updateSite} addUpload={addUpload} />}
          </main>
        </div>
      )}
    </AssetContext.Provider>
  )
}
