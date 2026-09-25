import { useEffect, useRef, useState } from 'react'
import { Eye, ImagePlus, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useAsset } from '../lib/prefs.jsx'
import { Markdown } from '../lib/markdown.jsx'
import { publicUrl } from '../lib/site-url.js'
import { toWebp } from './github.js'
import { makeShareCard } from './sharecard.js'
import { BiField, Group, Label, ListEditor, Select, TagInput, TextField, Toggle, inputCls } from './fields.jsx'

const slugify = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

const today = () => new Date().toISOString().slice(0, 10)

/* ------------------------------------------------------------------ */
/* Bouton « image de partage » (projets et billets)                    */
/* ------------------------------------------------------------------ */

export function ShareCardButton({ id, kicker, title, subtitle, image, kind, accent, site, addUpload }) {
  const asset = useAsset()
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null)
  const make = async () => {
    setBusy(true)
    try {
      const dataUrl = await makeShareCard({
        kicker,
        title,
        subtitle,
        image: image ? asset(image) : null,
        kind,
        accent,
        footer: `${publicUrl(site).replace(/^https:\/\//, '').replace(/\/$/, '')} · ${site.identity.name}`,
      })
      addUpload(`og/${id}.jpg`, dataUrl)
      setPreview(dataUrl)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={make} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-fg2 ring-1 ring-line ring-inset hover:text-fg">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Générer l'image de partage
        </button>
        <span className="text-xs text-subtle">Visible quand le lien est partagé sur LinkedIn, X… À refaire si le titre ou l'image change.</span>
      </div>
      {preview && <img src={preview} alt="" className="w-full max-w-md rounded-xl ring-1 ring-line" />}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Journal                                                            */
/* ------------------------------------------------------------------ */

function newPost(n) {
  return {
    id: `billet-${n}-${Date.now().toString(36).slice(-4)}`,
    visible: false,
    date: today(),
    cover: '',
    project: '',
    tags: [],
    title: { fr: '', en: '' },
    summary: { fr: '', en: '' },
    body: { fr: '', en: '' },
  }
}

function BodyEditor({ value, onChange, addUpload, postId }) {
  const asset = useAsset()
  const [lang, setLang] = useState('fr')
  const [preview, setPreview] = useState(false)
  const input = useRef(null)
  const area = useRef(null)
  const v = value ?? { fr: '', en: '' }
  const set = (text) => onChange({ ...v, [lang]: text })

  const insert = (snippet) => {
    const el = area.current
    const text = v[lang] ?? ''
    const pos = el ? el.selectionStart : text.length
    set(`${text.slice(0, pos)}${snippet}${text.slice(pos)}`)
  }
  const uploadImage = async (file) => {
    const { dataUrl } = await toWebp(file, 1600)
    const path = `journal/${postId}-${Date.now().toString(36)}.webp`
    addUpload(path, dataUrl)
    insert(`\n\n![](${path})\n\n`)
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Label>Texte du billet</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          {['fr', 'en'].map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={`rounded-full px-3 py-1 font-mono text-xs uppercase ${lang === l ? 'bg-fg text-bg' : 'text-muted ring-1 ring-line ring-inset'}`}>
              {l}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-line" />
          <button type="button" onClick={() => insert('**gras**')} className="rounded-lg px-2 py-1 text-xs font-bold text-muted ring-1 ring-line ring-inset hover:text-fg">
            B
          </button>
          <button type="button" onClick={() => insert('\n\n## Intertitre\n\n')} className="rounded-lg px-2 py-1 text-xs text-muted ring-1 ring-line ring-inset hover:text-fg">
            Titre
          </button>
          <button type="button" onClick={() => insert('\n- élément\n- élément\n')} className="rounded-lg px-2 py-1 text-xs text-muted ring-1 ring-line ring-inset hover:text-fg">
            Liste
          </button>
          <button type="button" onClick={() => insert('[texte du lien](https://)')} className="rounded-lg px-2 py-1 text-xs text-muted ring-1 ring-line ring-inset hover:text-fg">
            Lien
          </button>
          <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted ring-1 ring-line ring-inset hover:text-fg">
            <ImagePlus className="size-3.5" /> Image
          </button>
          <button type="button" onClick={() => setPreview((p) => !p)} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs ring-1 ring-inset ${preview ? 'bg-fg text-bg ring-fg' : 'text-muted ring-line'}`}>
            <Eye className="size-3.5" /> Aperçu
          </button>
        </div>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
      {preview ? (
        <div className="min-h-64 rounded-xl bg-bg p-5 ring-1 ring-line ring-inset">
          <Markdown text={v[lang]} asset={asset} />
        </div>
      ) : (
        <textarea ref={area} className={`${inputCls} min-h-80 font-mono text-[13px] leading-relaxed`} value={v[lang] ?? ''} onChange={(e) => set(e.target.value)} placeholder="Écrivez ici. ## pour un intertitre, **gras**, *italique*, - liste, > citation." />
      )}
    </div>
  )
}

export function JournalEditor({ posts, onChange, projects, site, addUpload }) {
  const asset = useAsset()
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1))
  const [selectedId, setSelectedId] = useState(sorted[0]?.id)
  const index = posts.findIndex((p) => p.id === selectedId)
  const p = posts[index]
  const cover = useRef(null)
  const isNew = p && !p.title?.fr && p.id.startsWith('billet-')

  const update = (patch) => {
    // Un changement d'adresse (id) doit garder le billet sélectionné ; pas de doublon d'adresse
    if (patch.id != null) {
      if (!patch.id || posts.some((x, j) => j !== index && x.id === patch.id)) delete patch.id
      else setSelectedId(patch.id)
    }
    onChange(posts.map((x, j) => (j === index ? { ...x, ...patch } : x)))
  }
  const add = () => {
    const np = newPost(posts.length + 1)
    onChange([np, ...posts])
    setSelectedId(np.id)
  }
  const remove = () => {
    if (!confirm(`Supprimer le billet « ${p.title?.fr || p.id} » ?`)) return
    onChange(posts.filter((_, j) => j !== index))
    setSelectedId(sorted.find((x) => x.id !== p.id)?.id)
  }
  const uploadCover = async (file) => {
    const { dataUrl } = await toWebp(file, 1600)
    const path = `journal/${p.id}-cover-${Date.now().toString(36)}.webp`
    addUpload(path, dataUrl)
    update({ cover: path })
  }
  const linked = projects.find((x) => x.id === p?.project)

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <div className="space-y-2 lg:sticky lg:top-24 lg:self-start">
        <button type="button" onClick={add} className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-fg px-3 py-2.5 text-sm font-medium text-bg">
          <Plus className="size-4" /> Nouveau billet
        </button>
        <p className="px-1 pt-2 text-xs text-subtle">Un billet en brouillon n'apparaît ni sur le site ni dans le flux RSS.</p>
        <ul className="space-y-1.5">
          {sorted.map((x) => (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => setSelectedId(x.id)}
                className={`w-full rounded-2xl p-3 text-left ring-1 transition ring-inset ${x.id === selectedId ? 'bg-card ring-fg/30' : 'ring-transparent hover:bg-card'}`}
              >
                <span className="flex items-center justify-between gap-2 text-[11px] text-subtle">
                  {x.date}
                  <span className={x.visible === false ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300'}>{x.visible === false ? 'Brouillon' : 'Publié'}</span>
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-fg">{x.title?.fr || 'Sans titre'}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {p ? (
        <div className="space-y-4">
          <Group title="Billet">
            <BiField
              label="Titre"
              value={p.title}
              onChange={(v) => update({ title: v, ...(isNew && v.fr ? { id: slugify(v.fr) || p.id } : {}) })}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField label="Date" type="date" value={p.date} onChange={(v) => update({ date: v })} />
              <TextField label="Adresse" hint="après /journal/" value={p.id} onChange={(v) => update({ id: slugify(v) })} />
              <Toggle label={p.visible === false ? 'Brouillon' : 'Publié'} checked={p.visible !== false} onChange={(v) => update({ visible: v })} />
            </div>
            <BiField label="Résumé" hint="1 à 2 phrases, visible dans les listes et les partages" value={p.summary} onChange={(v) => update({ summary: v })} multiline rows={2} />
            <BodyEditor value={p.body} onChange={(v) => update({ body: v })} addUpload={addUpload} postId={p.id} />
          </Group>

          <Group title="Illustration, projet lié, tags" defaultOpen={false}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <button type="button" onClick={() => cover.current?.click()} className="relative grid aspect-[16/9] w-full max-w-xs place-items-center overflow-hidden rounded-2xl bg-fg/5 text-sm text-muted ring-1 ring-line">
                {p.cover ? <img src={asset(p.cover)} alt="" className="absolute inset-0 size-full object-cover" /> : 'Choisir une image de couverture'}
              </button>
              <input ref={cover} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
              <div className="flex-1 space-y-4">
                <Select
                  label="Projet lié"
                  value={p.project}
                  onChange={(v) => update({ project: v })}
                  options={[{ value: '', label: '— Aucun —' }, ...projects.map((x) => ({ value: x.id, label: x.name }))]}
                />
                {p.cover && (
                  <button type="button" onClick={() => update({ cover: '' })} className="text-xs text-rose-500">
                    Retirer la couverture
                  </button>
                )}
              </div>
            </div>
            <TagInput label="Tags" value={p.tags ?? []} onChange={(v) => update({ tags: v })} />
          </Group>

          <Group title="Partage" defaultOpen={false}>
            <ShareCardButton
              id={p.id}
              kicker="Journal"
              title={p.title?.fr}
              subtitle={p.summary?.fr}
              image={linked?.images?.[0]?.src || p.cover}
              kind={linked?.images?.[0]?.kind || 'desktop'}
              accent={linked?.accent}
              site={site}
              addUpload={addUpload}
            />
          </Group>

          <div className="flex justify-between">
            <a href={`${import.meta.env.BASE_URL}journal/${p.id}/`} target="_blank" rel="noreferrer" className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
              Voir la page en ligne (après publication)
            </a>
            <button type="button" onClick={remove} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-rose-500 ring-1 ring-rose-500/30 ring-inset hover:bg-rose-500/10">
              <Trash2 className="size-4" /> Supprimer
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted">Aucun billet pour l'instant. Lancez-vous : même trois lignes sur une avancée suffisent.</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Réglages : domaine, SEO, stats, commentaires, mentions légales      */
/* ------------------------------------------------------------------ */

export function SettingsEditor({ site, update }) {
  const fb = site.feedback ?? {}
  return (
    <div className="space-y-4">
      <Group title="Adresse du site" hint="Domaine personnalisé, quand vous en aurez un">
        <TextField label="Domaine" placeholder="ex. sebastienkhai.fr (laisser vide pour engob.github.io/portofolio)" value={site.domain} onChange={(v) => update(['domain'], v.trim())} />
        <p className="text-xs text-subtle">
          Adresse actuelle : <span className="font-mono text-fg2">{publicUrl(site)}</span>. Renseigner un domaine ne suffit pas : il faut aussi le configurer chez votre
          registraire et dans GitHub → Settings → Pages (voir le guide).
        </p>
      </Group>

      <Group title="Référencement (SEO)">
        <BiField label="Description du site" hint="≈ 150 caractères, affichée par Google" value={site.seo?.description} onChange={(v) => update(['seo', 'description'], v)} multiline rows={2} />
        <TextField
          label="Code de vérification Google Search Console"
          hint="balise HTML → valeur de content"
          placeholder="ex. AbCdEf123…"
          value={site.seo?.googleVerification}
          onChange={(v) => update(['seo', 'googleVerification'], v.trim().replace(/^.*content="([^"]+)".*$/, '$1'))}
        />
      </Group>

      <Group title="Statistiques de visite" hint="GoatCounter : gratuit, sans cookie, sans bandeau de consentement">
        <TextField
          label="Code GoatCounter"
          placeholder="ex. sebastienkhai (pour sebastienkhai.goatcounter.com)"
          value={site.analytics?.goatcounter}
          onChange={(v) => update(['analytics', 'goatcounter'], v.trim().replace(/\.goatcounter\.com.*$/, '').replace(/^https?:\/\//, ''))}
        />
        <p className="text-xs text-subtle">
          Créez un compte sur{' '}
          <a className="underline" href="https://www.goatcounter.com/signup" target="_blank" rel="noreferrer">
            goatcounter.com
          </a>
          , puis collez ici le code choisi. Un rapport hebdomadaire arrive par email si le secret GOATCOUNTER_TOKEN est ajouté au dépôt (voir le guide).
        </p>
      </Group>

      <Group title="Retours des visiteurs" hint="Commentaires et réactions via Giscus (GitHub Discussions)">
        <Toggle label="Activer les commentaires" checked={fb.enabled} onChange={(v) => update(['feedback', 'enabled'], v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Dépôt" value={fb.repo} onChange={(v) => update(['feedback', 'repo'], v)} />
          <TextField label="Repo ID" value={fb.repoId} onChange={(v) => update(['feedback', 'repoId'], v)} />
          <TextField label="Catégorie" value={fb.category} onChange={(v) => update(['feedback', 'category'], v)} />
          <TextField label="Category ID" value={fb.categoryId} onChange={(v) => update(['feedback', 'categoryId'], v)} />
        </div>
        <p className="text-xs text-subtle">
          1. Activez Discussions sur le dépôt (Settings → Features). 2. Installez{' '}
          <a className="underline" href="https://github.com/apps/giscus" target="_blank" rel="noreferrer">
            l'app giscus
          </a>
          . 3. Sur{' '}
          <a className="underline" href="https://giscus.app/fr" target="_blank" rel="noreferrer">
            giscus.app
          </a>
          , choisissez la catégorie et recopiez les deux ID. Sans ça, un bouton « répondre par email » est proposé.
        </p>
      </Group>

      <Group title="Mentions légales & confidentialité" defaultOpen={false}>
        <BiField label="Titre" value={site.legal?.title} onChange={(v) => update(['legal', 'title'], v)} />
        <BiField label="Texte (Markdown)" value={site.legal?.body} onChange={(v) => update(['legal', 'body'], v)} multiline rows={14} />
      </Group>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Réseaux sociaux (onglet Profil)                                    */
/* ------------------------------------------------------------------ */

export function SocialsEditor({ socials = [], onChange }) {
  return (
    <ListEditor
      items={socials}
      onChange={onChange}
      template={{ network: 'linkedin', url: '' }}
      addLabel="Ajouter un réseau"
      itemLabel={(it) => it.network}
      render={(it, set) => (
        <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
          <Select
            value={it.network}
            onChange={(network) => set({ ...it, network })}
            options={[
              { value: 'linkedin', label: 'LinkedIn' },
              { value: 'x', label: 'X (Twitter)' },
              { value: 'bluesky', label: 'Bluesky' },
              { value: 'other', label: 'Autre' },
            ]}
          />
          <TextField placeholder="https://…" value={it.url} onChange={(url) => set({ ...it, url })} />
          {it.network === 'other' && <TextField label="Libellé" value={it.label} onChange={(label) => set({ ...it, label })} />}
        </div>
      )}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Import d'un dépôt GitHub en projet                                  */
/* ------------------------------------------------------------------ */

const pretty = (name) => name.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase())

export function repoToProject(r, owner) {
  const pages = r.has_pages ? `https://${owner.toLowerCase()}.github.io/${r.name}/` : null
  const desc = r.description || ''
  return {
    id: slugify(r.name),
    visible: false,
    status: 'wip',
    name: pretty(r.name),
    hook: { fr: desc, en: '' },
    pitch: { fr: desc, en: '' },
    problem: { fr: '', en: '' },
    idea: { fr: '', en: '' },
    how: { fr: '', en: '' },
    ai: [],
    stack: [...new Set([r.language, ...(r.topics ?? [])].filter(Boolean))],
    images: [],
    demo: r.homepage || pages,
    demoLabel: { fr: 'Ouvrir', en: 'Open' },
    repo: r.html_url,
    repoPrivate: !!r.private,
    accent: '#60a5fa',
  }
}

export function RepoImporter({ listRepos, projects, onImport, owner, onClose }) {
  const [state, setState] = useState({ loading: true, repos: [], error: '' })
  const known = new Set(projects.map((p) => (p.repo || '').toLowerCase().replace(/\/$/, '')))

  useEffect(() => {
    listRepos()
      .then((repos) => setState({ loading: false, repos, error: '' }))
      .catch((e) => setState({ loading: false, repos: [], error: e.message }))
  }, [listRepos])

  const list = state.repos.filter((r) => !r.fork && !known.has(r.html_url.toLowerCase()))
  return (
    <div className="rounded-3xl bg-card p-5 ring-1 ring-line ring-inset">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-medium text-fg">Importer un dépôt GitHub</p>
        <button type="button" onClick={onClose} className="text-sm text-muted hover:text-fg">
          Fermer
        </button>
      </div>
      {state.loading && <Loader2 className="size-5 animate-spin text-muted" />}
      {state.error && <p className="text-sm text-rose-500">{state.error}</p>}
      {!state.loading && !state.error && !list.length && <p className="text-sm text-muted">Tous vos dépôts publics sont déjà dans le portfolio.</p>}
      <ul className="max-h-96 space-y-1.5 overflow-y-auto">
        {list.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-line ring-inset">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-fg">{r.name}</span>
              <span className="block truncate text-xs text-subtle">
                {r.description || 'Sans description'} · mis à jour le {r.pushed_at?.slice(0, 10)}
                {r.has_pages && ' · GitHub Pages'}
              </span>
            </span>
            <button type="button" onClick={() => onImport(repoToProject(r, owner))} className="shrink-0 rounded-full bg-fg px-3 py-1.5 text-xs font-medium text-bg">
              Importer
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-subtle">Le projet est créé masqué, avec la description du dépôt. Complétez l'accroche, les images et l'histoire avant de l'afficher.</p>
    </div>
  )
}

