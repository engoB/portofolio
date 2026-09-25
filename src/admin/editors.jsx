import { useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, EyeOff, ImagePlus, Loader2, Monitor, Plus, Smartphone, Trash2 } from 'lucide-react'
import { useAsset } from '../lib/prefs.jsx'
import { GithubIcon } from '../components/ui.jsx'
import { toWebp } from './github.js'
import { BiField, Group, IconBtn, IconSelect, Label, ListEditor, Select, TagInput, TextField, Toggle } from './fields.jsx'
import { publicUrl } from '../lib/site-url.js'
import { RepoImporter, ShareCardButton, SocialKit, SocialsEditor } from './editors2.jsx'

export const STATUS_OPTIONS = [
  { value: '', label: '— Pas de badge —' },
  { value: 'live', label: 'En ligne / Live' },
  { value: 'beta', label: 'Bêta' },
  { value: 'wip', label: 'En cours' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'archived', label: 'Archivé' },
]

const emptyBi = () => ({ fr: '', en: '' })

export function newProject(n) {
  return {
    id: `projet-${Date.now().toString(36)}`,
    visible: false,
    status: 'wip',
    name: `Nouveau projet ${n}`,
    hook: emptyBi(),
    pitch: emptyBi(),
    problem: emptyBi(),
    idea: emptyBi(),
    how: emptyBi(),
    ai: [],
    stack: [],
    images: [],
    demo: '',
    demoLabel: emptyBi(),
    repo: '',
    repoPrivate: false,
    accent: '#60a5fa',
  }
}

/* ------------------------------------------------------------------ */
/* Images d'un projet                                                 */
/* ------------------------------------------------------------------ */

function ImageManager({ project, onChange, addUpload }) {
  const asset = useAsset()
  const input = useRef(null)
  const [busy, setBusy] = useState(false)
  const images = project.images ?? []

  const upload = async (files) => {
    setBusy(true)
    try {
      const added = []
      for (const [i, file] of [...files].entries()) {
        const probe = await toWebp(file, 4000)
        const kind = probe.height > probe.width ? 'mobile' : 'desktop'
        const { dataUrl } = await toWebp(file, kind === 'mobile' ? 720 : 1600)
        const path = `projects/${project.id}-${Date.now().toString(36)}${i}.webp`
        addUpload(path, dataUrl)
        added.push({ src: path, kind })
      }
      onChange([...images, ...added])
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= images.length) return
    const next = [...images]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const setKind = (i, kind) => onChange(images.map((im, j) => (j === i ? { ...im, kind } : im)))

  return (
    <div>
      <Label hint="La 1re image sert de visuel de carte. Portrait = cadre téléphone, paysage = navigateur.">Captures « en utilisation »</Label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {images.map((im, i) => (
          <div key={im.src + i} className="overflow-hidden rounded-2xl bg-bg ring-1 ring-line ring-inset">
            <div className="relative aspect-[4/5] bg-fg/5">
              <img src={asset(im.src)} alt="" className="absolute inset-0 size-full object-cover object-top" />
              {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-fg px-2 py-0.5 text-[10px] font-medium text-bg">Couverture</span>}
            </div>
            <div className="flex items-center justify-between gap-1 p-2">
              <div className="flex rounded-lg ring-1 ring-line ring-inset">
                <button type="button" title="Téléphone" onClick={() => setKind(i, 'mobile')} className={`grid size-7 place-items-center rounded-l-lg ${im.kind === 'mobile' ? 'bg-fg text-bg' : 'text-muted'}`}>
                  <Smartphone className="size-3.5" />
                </button>
                <button type="button" title="Navigateur" onClick={() => setKind(i, 'desktop')} className={`grid size-7 place-items-center rounded-r-lg ${im.kind !== 'mobile' ? 'bg-fg text-bg' : 'text-muted'}`}>
                  <Monitor className="size-3.5" />
                </button>
              </div>
              <div className="flex gap-1">
                <IconBtn onClick={() => move(i, -1)} label="Avant" disabled={i === 0}>
                  <ArrowLeft className="size-3.5" />
                </IconBtn>
                <IconBtn onClick={() => move(i, 1)} label="Après" disabled={i === images.length - 1}>
                  <ArrowRight className="size-3.5" />
                </IconBtn>
                <IconBtn onClick={() => onChange(images.filter((_, j) => j !== i))} label="Retirer" danger>
                  <Trash2 className="size-3.5" />
                </IconBtn>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="grid aspect-[4/5] place-items-center rounded-2xl border-2 border-dashed border-line text-sm text-muted transition hover:border-fg/30 hover:text-fg"
        >
          <span className="flex flex-col items-center gap-2">
            {busy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            Ajouter des images
          </span>
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files?.length && upload(e.target.files)} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Projets                                                            */
/* ------------------------------------------------------------------ */

export function ProjectsEditor({ projects, onChange, addUpload, listRepos, site }) {
  const asset = useAsset()
  const [selectedId, setSelectedId] = useState(projects[0]?.id)
  const [importing, setImporting] = useState(false)
  const index = projects.findIndex((p) => p.id === selectedId)
  const p = projects[index]

  const update = (i, patch) => onChange(projects.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= projects.length) return
    const next = [...projects]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const add = () => {
    const np = newProject(projects.length + 1)
    onChange([...projects, np])
    setSelectedId(np.id)
  }
  const remove = () => {
    if (!confirm(`Supprimer « ${p.name} » ? (Les images restent dans le dépôt.)`)) return
    const next = projects.filter((_, j) => j !== index)
    onChange(next)
    setSelectedId(next[Math.max(0, index - 1)]?.id)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      {/* Liste */}
      <div className="space-y-2 lg:sticky lg:top-24 lg:self-start">
        <p className="px-1 text-xs text-subtle">L'ordre ici = l'ordre du carrousel. L'œil masque ou affiche un projet.</p>
        <ul className="space-y-1.5">
          {projects.map((x, i) => (
            <li key={x.id}>
              <div
                className={`flex items-center gap-2 rounded-2xl p-2 ring-1 transition ring-inset ${x.id === selectedId ? 'bg-card ring-fg/30' : 'ring-transparent hover:bg-card'} ${x.visible === false ? 'opacity-55' : ''}`}
              >
                <button type="button" onClick={() => setSelectedId(x.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-fg/5 ring-1 ring-line" style={{ background: x.images?.[0] ? undefined : x.accent }}>
                    {x.images?.[0] && <img src={asset(x.images[0].src)} alt="" className="size-full object-cover object-top" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg">{x.name}</span>
                    <span className="block text-[11px] text-subtle">{x.visible === false ? 'Masqué' : STATUS_OPTIONS.find((s) => s.value === (x.status ?? ''))?.label}</span>
                  </span>
                </button>
                <IconBtn onClick={() => update(i, { visible: x.visible === false })} label={x.visible === false ? 'Afficher' : 'Masquer'}>
                  {x.visible === false ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </IconBtn>
                <div className="flex flex-col">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" className="text-subtle hover:text-fg disabled:opacity-20">
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === projects.length - 1} aria-label="Descendre" className="text-subtle hover:text-fg disabled:opacity-20">
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={add} className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm text-fg2 ring-1 ring-line ring-inset hover:text-fg">
            <Plus className="size-4" /> Nouveau
          </button>
          <button type="button" onClick={() => setImporting(true)} className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-sm text-fg2 ring-1 ring-line ring-inset hover:text-fg">
            <GithubIcon className="size-4" /> Depuis GitHub
          </button>
        </div>
      </div>

      {/* Fiche */}
      {importing ? (
        <RepoImporter
          listRepos={listRepos}
          projects={projects}
          owner={site.repo.owner}
          onClose={() => setImporting(false)}
          onImport={(np) => {
            const id = projects.some((x) => x.id === np.id) ? `${np.id}-${Date.now().toString(36).slice(-3)}` : np.id
            onChange([...projects, { ...np, id }])
            setSelectedId(id)
            setImporting(false)
          }}
        />
      ) : p ? (
        <div className="space-y-4">
          <Group title="L'essentiel">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nom" value={p.name} onChange={(v) => update(index, { name: v })} />
              <Select label="Badge de statut" value={p.status ?? ''} onChange={(v) => update(index, { status: v })} options={STATUS_OPTIONS} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Toggle label="Visible sur le site" checked={p.visible !== false} onChange={(v) => update(index, { visible: v })} />
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm text-fg">Couleur d'ambiance</span>
                <span className="flex items-center gap-2">
                  <input type="color" value={p.accent || '#60a5fa'} onChange={(e) => update(index, { accent: e.target.value })} className="h-8 w-12 cursor-pointer rounded-lg bg-transparent" />
                  <span className="font-mono text-xs text-subtle">{p.accent}</span>
                </span>
              </label>
            </div>
          </Group>

          <Group title="Accroche" hint="Ce que l'on voit sur la carte du carrousel">
            <BiField label="Phrase d'accroche" value={p.hook} onChange={(v) => update(index, { hook: v })} />
            <BiField label="Présentation courte" hint="2 phrases, simples et accueillantes" value={p.pitch} onChange={(v) => update(index, { pitch: v })} multiline rows={3} />
          </Group>

          <Group title="Images" hint="Glissez des captures d'écran de l'app en utilisation">
            <ImageManager project={p} onChange={(images) => update(index, { images })} addUpload={addUpload} />
          </Group>

          <Group title="L'histoire (texte à déplier)" hint="Visible quand on ouvre la fiche" defaultOpen={false}>
            <BiField label="Le problème" value={p.problem} onChange={(v) => update(index, { problem: v })} multiline rows={4} />
            <BiField label="L'idée" value={p.idea} onChange={(v) => update(index, { idea: v })} multiline rows={4} />
            <BiField label="Comment c'est construit" value={p.how} onChange={(v) => update(index, { how: v })} multiline rows={4} />
          </Group>

          <Group title="IA & outils" defaultOpen={false}>
            <TagInput label="IA utilisée dans le produit" hint="Entrée ou virgule pour ajouter" value={p.ai ?? []} onChange={(v) => update(index, { ai: v })} />
            <TagInput label="Outils & technos" value={p.stack ?? []} onChange={(v) => update(index, { stack: v })} />
          </Group>

          <Group title="Liens" defaultOpen={false}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Lien de démo" placeholder="https://…" value={p.demo ?? ''} onChange={(v) => update(index, { demo: v || null })} />
              <TextField label="Dépôt GitHub" placeholder="https://github.com/…" value={p.repo ?? ''} onChange={(v) => update(index, { repo: v })} />
            </div>
            <BiField label="Texte du bouton de démo" hint="ex. « Jouer », « Essayer »" value={p.demoLabel} onChange={(v) => update(index, { demoLabel: v })} />
            <Toggle label="Code privé" hint="Remplace le lien du dépôt par « Code privé »" checked={p.repoPrivate} onChange={(v) => update(index, { repoPrivate: v })} />
            <Toggle
              label="Pensé pour le téléphone"
              hint="Sur ordinateur, la démo s'ouvre dans un cadre de téléphone avec un QR code, et la fiche conseille de l'essayer sur mobile"
              checked={p.mobileFirst}
              onChange={(v) => update(index, { mobileFirst: v })}
            />
          </Group>

          <Group title="Partage" hint="Image affichée quand on partage la page du projet" defaultOpen={false}>
            <ShareCardButton
              id={p.id}
              kicker="Projet"
              title={p.name}
              subtitle={p.hook?.fr}
              image={p.images?.[0]?.src}
              kind={p.images?.[0]?.kind}
              accent={p.accent}
              site={site}
              addUpload={addUpload}
            />
            <SocialKit
              id={p.id}
              kicker="Projet"
              title={p.name}
              subtitle={p.hook?.fr}
              image={p.images?.[0]?.src}
              kind={p.images?.[0]?.kind}
              accent={p.accent}
              site={site}
              url={`${publicUrl(site)}projets/${p.id}/`}
              tags={p.stack?.slice(0, 3)}
            />
          </Group>

          <div className="flex justify-end">
            <button type="button" onClick={remove} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-rose-500 ring-1 ring-rose-500/30 ring-inset hover:bg-rose-500/10">
              <Trash2 className="size-4" /> Supprimer ce projet
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted">Aucun projet. Créez-en un.</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Textes du site                                                     */
/* ------------------------------------------------------------------ */

function HeadingFields({ data, set }) {
  return (
    <>
      <BiField label="Surtitre" value={data.eyebrow} onChange={(v) => set('eyebrow', v)} />
      <div className="grid gap-4 lg:grid-cols-2">
        <BiField label="Titre" value={data.title} onChange={(v) => set('title', v)} />
        <BiField label="Fin du titre (en italique dégradé)" value={data.accent} onChange={(v) => set('accent', v)} />
      </div>
    </>
  )
}

export function TextsEditor({ site, update }) {
  const at = (section) => (key, v) => update([section, key], v)

  return (
    <div className="space-y-4">
      <Group title="Accueil (hero)">
        <BiField label="Surtitre" value={site.hero.kicker} onChange={(v) => update(['hero', 'kicker'], v)} />
        <div className="grid gap-4 lg:grid-cols-2">
          <BiField label="Titre" value={site.hero.title} onChange={(v) => update(['hero', 'title'], v)} />
          <BiField label="Fin du titre (italique)" value={site.hero.accent} onChange={(v) => update(['hero', 'accent'], v)} />
        </div>
        <BiField label="Introduction" value={site.hero.intro} onChange={(v) => update(['hero', 'intro'], v)} multiline rows={4} />
        <div className="grid gap-4 lg:grid-cols-2">
          <BiField label="Bouton principal" value={site.hero.ctaPrimary} onChange={(v) => update(['hero', 'ctaPrimary'], v)} />
          <BiField label="Bouton secondaire" value={site.hero.ctaSecondary} onChange={(v) => update(['hero', 'ctaSecondary'], v)} />
        </div>
      </Group>

      <Group title="L'expérimentation" defaultOpen={false}>
        <HeadingFields data={site.manifesto} set={at('manifesto')} />
        <BiField label="Texte" value={site.manifesto.body} onChange={(v) => update(['manifesto', 'body'], v)} multiline rows={4} />
        <Label>Principes</Label>
        <ListEditor
          items={site.manifesto.principles}
          onChange={(v) => update(['manifesto', 'principles'], v)}
          template={{ icon: 'sparkles', title: { fr: '', en: '' }, text: { fr: '', en: '' } }}
          addLabel="Ajouter un principe"
          render={(it, set) => (
            <>
              <IconSelect value={it.icon} onChange={(icon) => set({ ...it, icon })} />
              <BiField label="Titre" value={it.title} onChange={(title) => set({ ...it, title })} />
              <BiField label="Texte" value={it.text} onChange={(text) => set({ ...it, text })} multiline />
            </>
          )}
        />
      </Group>

      <Group title="En-tête des projets" defaultOpen={false}>
        <HeadingFields data={site.projectsSection} set={at('projectsSection')} />
        <BiField label="Introduction" value={site.projectsSection.intro} onChange={(v) => update(['projectsSection', 'intro'], v)} multiline />
      </Group>

      <Group title="Ma façon de faire (méthode)" defaultOpen={false}>
        <HeadingFields data={site.method} set={at('method')} />
        <BiField label="Introduction" value={site.method.intro} onChange={(v) => update(['method', 'intro'], v)} multiline rows={4} />
        <Label>Étapes</Label>
        <ListEditor
          items={site.method.steps}
          onChange={(v) => update(['method', 'steps'], v)}
          template={{ icon: 'sparkles', title: { fr: '', en: '' }, text: { fr: '', en: '' }, tools: [] }}
          addLabel="Ajouter une étape"
          render={(it, set) => (
            <>
              <IconSelect value={it.icon} onChange={(icon) => set({ ...it, icon })} />
              <BiField label="Titre" value={it.title} onChange={(title) => set({ ...it, title })} />
              <BiField label="Texte" value={it.text} onChange={(text) => set({ ...it, text })} multiline />
              <TagInput label="Outils" value={it.tools ?? []} onChange={(tools) => set({ ...it, tools })} />
            </>
          )}
        />
      </Group>

      <Group title="Pourquoi ce profil" defaultOpen={false}>
        <HeadingFields data={site.why} set={at('why')} />
        <BiField label="Texte principal" value={site.why.body} onChange={(v) => update(['why', 'body'], v)} multiline rows={5} />
        <BiField label="Titre « D'où je viens »" value={site.why.originTitle} onChange={(v) => update(['why', 'originTitle'], v)} />
        <BiField label="D'où je viens" value={site.why.origin} onChange={(v) => update(['why', 'origin'], v)} multiline rows={5} />
        <Label>Atouts</Label>
        <ListEditor
          items={site.why.strengths}
          onChange={(v) => update(['why', 'strengths'], v)}
          template={{ title: { fr: '', en: '' }, text: { fr: '', en: '' } }}
          addLabel="Ajouter un atout"
          render={(it, set) => (
            <>
              <BiField label="Titre" value={it.title} onChange={(title) => set({ ...it, title })} />
              <BiField label="Texte" value={it.text} onChange={(text) => set({ ...it, text })} multiline />
            </>
          )}
        />
      </Group>

      <Group title="Boîte à outils" defaultOpen={false}>
        <HeadingFields data={site.skills} set={at('skills')} />
        <Label>Groupes</Label>
        <ListEditor
          items={site.skills.groups}
          onChange={(v) => update(['skills', 'groups'], v)}
          template={{ title: { fr: '', en: '' }, items: [] }}
          addLabel="Ajouter un groupe"
          render={(it, set) => (
            <>
              <BiField label="Titre du groupe" value={it.title} onChange={(title) => set({ ...it, title })} />
              <TagInput label="Éléments" value={it.items} onChange={(items) => set({ ...it, items })} />
            </>
          )}
        />
        <div className="rounded-2xl bg-bg p-4 ring-1 ring-line ring-inset">
          <Toggle label="Afficher l'« héritage image »" hint="3D, VR, vidéo… présentés comme l'origine de votre œil" checked={site.skills.heritage.show} onChange={(v) => update(['skills', 'heritage', 'show'], v)} />
          <div className="mt-3 space-y-3">
            <BiField label="Titre" value={site.skills.heritage.title} onChange={(v) => update(['skills', 'heritage', 'title'], v)} />
            <BiField label="Note" value={site.skills.heritage.note} onChange={(v) => update(['skills', 'heritage', 'note'], v)} />
            <TagInput label="Éléments" value={site.skills.heritage.items} onChange={(v) => update(['skills', 'heritage', 'items'], v)} />
          </div>
        </div>
        <p className="text-xs text-subtle">Astuce : un élément ajouté ici s'affiche tel quel dans les deux langues.</p>
      </Group>

      <Group title="Contact" defaultOpen={false}>
        <HeadingFields data={site.contact} set={at('contact')} />
        <BiField label="Texte" value={site.contact.text} onChange={(v) => update(['contact', 'text'], v)} multiline rows={4} />
      </Group>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Profil, liens, sections                                            */
/* ------------------------------------------------------------------ */

const SECTION_LABELS = {
  manifesto: "L'expérimentation",
  projects: 'Projets',
  journal: 'Journal',
  method: 'Méthode',
  why: 'Pourquoi ce profil',
  skills: 'Boîte à outils',
  contact: 'Contact',
}

export function ProfileEditor({ site, update, addUpload }) {
  const asset = useAsset()
  const input = useRef(null)
  const { identity, links, sections } = site

  const uploadPhoto = async (file) => {
    const { dataUrl } = await toWebp(file, 800)
    const path = `img/photo-${Date.now().toString(36)}.webp`
    addUpload(path, dataUrl)
    update(['identity', 'photo'], path)
  }

  return (
    <div className="space-y-4">
      <Group title="Identité">
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="shrink-0">
            <Label>Photo</Label>
            <button type="button" onClick={() => input.current?.click()} className="group relative block size-28 overflow-hidden rounded-3xl bg-fg/5 ring-1 ring-line">
              {identity.photo && <img src={asset(identity.photo)} alt="" className="size-full object-cover" />}
              <span className="absolute inset-0 grid place-items-center bg-black/50 text-xs text-white opacity-0 transition group-hover:opacity-100">Changer</span>
            </button>
            <input ref={input} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
              <TextField label="Nom affiché" value={identity.name} onChange={(v) => update(['identity', 'name'], v)} />
              <TextField label="Initiales" value={identity.initials} onChange={(v) => update(['identity', 'initials'], v)} />
            </div>
            <Toggle label="Afficher la photo" checked={identity.showPhoto} onChange={(v) => update(['identity', 'showPhoto'], v)} />
          </div>
        </div>
        <BiField label="Intitulé" hint="ex. Product Builder" value={identity.role} onChange={(v) => update(['identity', 'role'], v)} />
        <BiField label="Localisation" value={identity.location} onChange={(v) => update(['identity', 'location'], v)} />
        <BiField label="Pastille de statut" value={identity.status} onChange={(v) => update(['identity', 'status'], v)} />
        <Toggle label="Afficher la pastille de statut" checked={identity.showStatus} onChange={(v) => update(['identity', 'showStatus'], v)} />
      </Group>

      <Group title="Liens">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Email" type="email" value={links.email} onChange={(v) => update(['links', 'email'], v)} />
          <TextField label="GitHub" value={links.github} onChange={(v) => update(['links', 'github'], v)} />
          <TextField label="ArtStation" value={links.artstation} onChange={(v) => update(['links', 'artstation'], v)} />
        </div>
        <Label>Réseaux sociaux</Label>
        <SocialsEditor socials={links.socials} onChange={(v) => update(['links', 'socials'], v)} />
        <Toggle label="Afficher le lien ArtStation (discret, en pied de page)" checked={links.showArtstation} onChange={(v) => update(['links', 'showArtstation'], v)} />
        <BiField label="Texte du lien ArtStation" value={links.artstationLabel} onChange={(v) => update(['links', 'artstationLabel'], v)} />
        <p className="text-xs text-subtle">Un lien vide n'est pas affiché.</p>
      </Group>

      <Group title="Sections affichées">
        {Object.entries(SECTION_LABELS).map(([key, label]) => (
          <Toggle key={key} label={label} checked={sections[key]} onChange={(v) => update(['sections', key], v)} />
        ))}
      </Group>
    </div>
  )
}
