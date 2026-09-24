# Sébastien Khai — Product Builder

Portfolio augmenté one-page (React + Tailwind CSS + Lucide React) déployé sur GitHub Pages : https://engob.github.io/portofolio/
Toutes les données sont dans `src/data/` : **aucune information de projet n'est écrite dans les composants.**

| Fichier | Contenu |
|---|---|
| `src/data/projects.json` | Les dépôts affichés dans le Hub Outils (une entrée = une carte) |
| `src/data/projects.schema.json` | Le schéma : autocomplétion et validation dans VS Code |
| `src/data/profile.json` | Identité, accroche, liens, proposition de valeur, CV, méthode IA |
| `src/components/` | Sections de la page (Hero, Produits, Parcours…) — aucune donnée en dur |
| `public/projects/` | Captures d'écran des produits (WebP, ~1600 px de large en desktop, 640 px en mobile) |
| `public/img/` | Portrait |
| `public/cv-sebastien-khai.pdf` | CV téléchargeable |
| `public/og.jpg` | Image d'aperçu pour LinkedIn / réseaux (1200 × 630) |

## Démarrer

```bash
npm install          # installer les dépendances
npm run dev          # serveur local → http://localhost:5173/portofolio/
npm run build        # build de production dans dist/
npm run preview      # tester le build → http://localhost:4173/portofolio/
```

## Ajouter un projet (30 secondes)

Copier ce bloc à la fin du tableau de `src/data/projects.json` (penser à la virgule après l'entrée précédente) :

```json
{
  "id": "mon-outil",
  "name": "Mon Outil",
  "tagline": "Une phrase qui dit ce que ça fait.",
  "status": "beta",
  "category": "Productivité",
  "tags": ["PWA", "Automatisation"],
  "featured": false,
  "problem": "Le problème métier concret résolu.",
  "solution": "L'idée directrice de la solution.",
  "architecture": ["Choix d'architecture 1", "Choix d'architecture 2"],
  "ai": ["Claude Sonnet 5"],
  "apis": ["Anthropic API", "FastAPI"],
  "builtWith": ["Claude Code"],
  "highlights": ["Un chiffre marquant"],
  "repo": "https://github.com/engoB/mon-outil",
  "demo": "https://engob.github.io/mon-outil/",
  "image": "projects/mon-outil.webp",
  "imageKind": "desktop",
  "accent": "#60a5fa"
}
```

- `status` : `production` · `beta` · `en-cours` · `prototype` · `archive`
- `featured: true` affiche le produit en grand format « étude de cas » ; sinon il rejoint la grille « Et aussi ».
- `image` : capture déposée dans `public/projects/` ; `imageKind` : `desktop` (cadre navigateur) ou `mobile` (cadre téléphone) ; `accent` : couleur du halo.
- `category` crée automatiquement un nouveau filtre ; les `tags` sont cliquables.
- `ai` = modèles utilisés **par le produit** (chips violettes, filtre « IA intégrée ») ; `apis` = services externes ; `builtWith` = outils d'IA utilisés **pour le construire**.
- Optionnels : `version`, `year`, `highlights`, `demoLabel` (« Jouer », « Site »…), `repoPrivate: true` (affiche « Code privé » au lieu du lien), `demo: null`.
- Les chiffres clés du hero (nombre d'outils, en production, API) se recalculent seuls.

## CV téléchargeable et liens

Le CV est `public/cv-sebastien-khai.pdf` (référencé par `links.cv` dans `profile.json`). Pour le remplacer, déposer un nouveau PDF au même nom.
Dans `links`, un lien vide masque le bouton correspondant (ex. `"linkedin": ""`).

## Déploiement GitHub Pages

1. **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. Pousser sur `main` : le workflow `.github/workflows/deploy.yml` construit et publie le site.
3. Adresse : `https://engob.github.io/portofolio/`.

> Le dépôt est privé : GitHub Pages sur un dépôt privé nécessite un compte GitHub Pro.
> Sinon, passer le dépôt en public (Settings → General → Danger Zone → Change visibility).

Le chemin de base (`/portofolio/`) est fixé dans `vite.config.js` et suit automatiquement le nom du dépôt en CI.
Pour un domaine personnalisé ou un dépôt `engob.github.io`, construire avec `BASE_PATH=/`.
