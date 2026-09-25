# Sébastien Khai — carnet de bord

Site vitrine one-page, bilingue (FR / EN), thème clair et sombre, déployé sur GitHub Pages :
https://engob.github.io/portofolio/

Stack : React + Tailwind CSS + Lucide React, construit avec Vite.

## Modifier le site : l'espace perso

**https://engob.github.io/portofolio/#/admin** (à garder en favori, aucun lien public n'y mène)

Depuis le navigateur, sans toucher au code, vous pouvez :

- **Projets** : afficher ou masquer un projet (icône œil), changer son badge de statut (En ligne, Bêta, En cours, Prototype, Archivé, ou aucun), l'ordre du carrousel, les textes FR/EN, les images, les liens. Vous pouvez aussi en créer un nouveau.
- **Textes** : toutes les sections de la page, en FR et en EN.
- **Profil & affichage** : nom, photo, intitulé, pastille de statut, liens (email, LinkedIn, GitHub, ArtStation), sections affichées.
- **Journal** : écrire des billets (FR/EN, Markdown simple, images), brouillon ou publié, lié à un projet.
- **Importer depuis GitHub** : transformer un dépôt en projet (pré-rempli, masqué par défaut).
- **Image de partage** : générer la vignette LinkedIn / X d'un projet ou d'un billet.
- **Réglages** : domaine, référencement, statistiques, commentaires, mentions légales.
- **Aperçu** : voir le résultat avant de publier.
- **Publier** : un seul commit sur `main`. Le site est à jour environ une minute après.

### Le jeton d'accès (une seule fois)

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → *Generate new token*
   (lien direct : https://github.com/settings/personal-access-tokens/new).
2. *Repository access* : **Only select repositories** → `engoB/portofolio`.
3. *Permissions* : **Contents → Read and write**. Rien d'autre.
4. Collez le jeton dans l'espace perso. Il reste dans votre navigateur et n'est envoyé qu'à GitHub.

Le jeton expire : il suffit d'en recréer un. Si vous pensez qu'il a fuité, révoquez-le sur la même page GitHub.

## Visibilité, retours et statistiques

| Brique | Rôle | À activer |
|---|---|---|
| Pages prérendues | Une vraie page par projet (`/projets/<id>/`) et par billet (`/journal/<id>/`), avec titre, description et image de partage | Automatique au build |
| `sitemap.xml`, `feed.xml`, JSON-LD | Référencement Google, flux RSS du journal, fiche « Person » | Automatique |
| Giscus | Commentaires et réactions sous chaque billet et chaque projet (GitHub Discussions) | Réglages → Retours des visiteurs |
| GoatCounter | Statistiques de visite sans cookie | Réglages → Statistiques |
| Rapport hebdo | Chaque lundi, une issue GitHub (donc un email) résume les visites | Secret `GOATCOUNTER_TOKEN` dans Settings → Secrets → Actions |

## Domaine personnalisé

1. Achetez le domaine (ex. chez OVH, Gandi, Cloudflare).
2. Espace perso → Réglages → Domaine : `mondomaine.fr`, puis Publier (le fichier `CNAME` et les adresses se mettent à jour).
3. Chez le registraire : un enregistrement `CNAME www → engob.github.io` et les 4 `A` de GitHub Pages pour la racine.
4. GitHub → Settings → Pages → Custom domain, puis cocher *Enforce HTTPS*.

## Où vit le contenu

| Fichier | Contenu |
|---|---|
| `src/content/site.json` | Tous les textes (FR/EN), identité, liens, sections affichées |
| `src/content/projects.json` | Les projets, dans l'ordre du carrousel |
| `src/content/posts.json` | Les billets du journal |
| `public/og/` | Images de partage (1200 × 630) des projets et billets |
| `public/projects/` | Captures d'écran des projets (WebP) |
| `public/img/` | Photo |
| `public/og.jpg` | Image d'aperçu pour LinkedIn / réseaux (1200 × 630) |

Aucun texte de contenu n'est écrit dans les composants (`src/components/`). Un champ texte vaut soit une chaîne,
soit `{ "fr": "…", "en": "…" }`.

### Ajouter un projet à la main (sans l'espace perso)

Ajouter un bloc dans `src/content/projects.json` :

```json
{
  "id": "mon-outil",
  "visible": true,
  "status": "beta",
  "name": "Mon Outil",
  "hook": { "fr": "L'accroche en une phrase.", "en": "The one-line hook." },
  "pitch": { "fr": "Deux phrases simples.", "en": "Two simple sentences." },
  "problem": { "fr": "Le problème.", "en": "The problem." },
  "idea": { "fr": "L'idée.", "en": "The idea." },
  "how": { "fr": "Comment c'est construit.", "en": "How it's built." },
  "ai": ["Claude"],
  "stack": ["PWA", "GitHub Actions"],
  "images": [{ "src": "projects/mon-outil-1.webp", "kind": "mobile" }],
  "demo": "https://engob.github.io/mon-outil/",
  "demoLabel": { "fr": "Essayer", "en": "Try it" },
  "repo": "https://github.com/engoB/mon-outil",
  "repoPrivate": false,
  "accent": "#60a5fa"
}
```

`status` : `live`, `beta`, `wip`, `prototype`, `archived` ou `""` (pas de badge).
`kind` : `mobile` (cadre téléphone) ou `desktop` (cadre navigateur).

## Développement

```bash
npm install
npm run dev       # http://localhost:5173/portofolio/
npm run build     # build de production + prérendu des pages dans dist/
npm run preview   # tester le build
```

## Déploiement

`.github/workflows/deploy.yml` construit et publie le site à chaque push sur `main`
(Settings → Pages → Source : **GitHub Actions**). Le chemin de base suit le nom du dépôt.
