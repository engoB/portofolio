import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Chemin de base du site :
// - domaine personnalisé renseigné dans src/content/site.json ("domain") → "/"
// - sinon GitHub Pages « projet » : /<nom-du-dépôt>/ (le workflow passe BASE_PATH)
const site = JSON.parse(readFileSync(new URL('./src/content/site.json', import.meta.url), 'utf8'))
const base = site.domain ? '/' : (process.env.BASE_PATH ?? `/${site.repo.name}/`)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
})
