# Portfolio augmenté

Site vitrine one-page (React + Tailwind CSS + Lucide React) déployé sur GitHub Pages.
Toutes les données sont dans `src/data/` : **aucune information de projet n'est écrite dans les composants.**

| Fichier | Contenu |
|---|---|
| `src/data/projects.json` | Les dépôts affichés dans le Hub Outils (une entrée = une carte) |
| `src/data/projects.schema.json` | Le schéma : autocomplétion et validation dans VS Code |
| `src/data/profile.json` | Identité, liens, CV (expériences, formations, compétences), méthode IA |
| `public/` | Fichiers servis tels quels (mettre ici `cv.pdf`) |

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
  "demo": "https://engob.github.io/mon-outil/"
}
```

- `status` : `production` · `beta` · `en-cours` · `prototype` · `archive`
- `category` crée automatiquement un nouveau filtre ; les `tags` sont cliquables.
- `ai` = modèles utilisés **par le produit** (chips violettes, filtre « IA intégrée ») ; `apis` = services externes ; `builtWith` = outils d'IA utilisés **pour le construire**.
- Optionnels : `version`, `year`, `highlights`, `demoLabel` (« Jouer », « Site »…), `repoPrivate: true` (affiche « Code privé » au lieu du lien), `demo: null`.
- Les chiffres clés du hero (nombre d'outils, en production, API) se recalculent seuls.

## CV téléchargeable

Déposer le PDF dans `public/cv.pdf`, puis dans `src/data/profile.json` : `"cv": "cv.pdf"`.
Les boutons « Télécharger le CV » apparaissent alors automatiquement. Même principe pour `linkedin` et `email` : un lien vide = bouton masqué.

## Déploiement GitHub Pages

1. **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. Pousser sur `main` : le workflow `.github/workflows/deploy.yml` construit et publie le site.
3. Adresse : `https://engob.github.io/portofolio/`.

> Le dépôt est privé : GitHub Pages sur un dépôt privé nécessite un compte GitHub Pro.
> Sinon, passer le dépôt en public (Settings → General → Danger Zone → Change visibility).

Le chemin de base (`/portofolio/`) est fixé dans `vite.config.js` et suit automatiquement le nom du dépôt en CI.
Pour un domaine personnalisé ou un dépôt `engob.github.io`, construire avec `BASE_PATH=/`.
