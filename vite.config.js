import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages sert un site « projet » sous https://<compte>.github.io/<nom-du-depot>/.
// Le chemin de base doit donc être /<nom-du-depot>/ en production.
// - Le workflow de déploiement passe BASE_PATH automatiquement (nom du dépôt).
// - Si tu renommes le dépôt en <compte>.github.io ou ajoutes un domaine perso, mets BASE_PATH=/.
const base = process.env.BASE_PATH ?? '/portofolio/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Même chemin en dev, en preview et en production : http://localhost:5173/portofolio/
  base,
})
