import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/* ------------------------------------------------------------------ */
/* Textes de l'interface (le contenu éditable vit dans src/content/)  */
/* ------------------------------------------------------------------ */

export const UI = {
  fr: {
    nav: { manifesto: 'Expérimentation', projects: 'Projets', method: 'Méthode', why: 'Profil', contact: 'Contact' },
    menu: 'Menu',
    theme: { toLight: 'Passer en thème clair', toDark: 'Passer en thème sombre' },
    lang: { switch: 'Switch to English', short: 'EN' },
    skip: 'Aller aux projets',
    status: { live: 'En ligne', beta: 'Bêta', wip: 'En cours', prototype: 'Prototype', archived: 'Archivé' },
    discover: 'Découvrir',
    problem: 'Le problème',
    idea: "L'idée",
    how: "Comment c'est construit",
    ai: 'IA dans le produit',
    stack: 'Outils',
    code: 'Code source',
    privateCode: 'Code privé',
    open: 'Ouvrir',
    close: 'Fermer',
    prev: 'Précédent',
    next: 'Suivant',
    scrollHint: 'Faites défiler',
    gallery: 'Captures',
    email: 'Écrire un email',
    copy: "Copier l'adresse",
    copied: 'Copié',
    footer: "Carnet de bord d'une expérimentation en cours.",
    madeWith: 'Conçu et codé avec l’IA, React et Tailwind CSS.',
  },
  en: {
    nav: { manifesto: 'Experiment', projects: 'Projects', method: 'Method', why: 'Profile', contact: 'Contact' },
    menu: 'Menu',
    theme: { toLight: 'Switch to light theme', toDark: 'Switch to dark theme' },
    lang: { switch: 'Passer en français', short: 'FR' },
    skip: 'Skip to projects',
    status: { live: 'Live', beta: 'Beta', wip: 'In progress', prototype: 'Prototype', archived: 'Archived' },
    discover: 'Discover',
    problem: 'The problem',
    idea: 'The idea',
    how: "How it's built",
    ai: 'AI in the product',
    stack: 'Tools',
    code: 'Source code',
    privateCode: 'Private code',
    open: 'Open',
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
    scrollHint: 'Scroll',
    gallery: 'Screenshots',
    email: 'Send an email',
    copy: 'Copy address',
    copied: 'Copied',
    footer: 'Logbook of an ongoing experiment.',
    madeWith: 'Designed and coded with AI, React and Tailwind CSS.',
  },
}

/* ------------------------------------------------------------------ */
/* Langue + thème                                                     */
/* ------------------------------------------------------------------ */

const PrefsContext = createContext(null)

const safeGet = (k) => {
  try {
    return localStorage.getItem(k)
  } catch {
    return null
  }
}
const safeSet = (k, v) => {
  try {
    localStorage.setItem(k, v)
  } catch {
    /* navigation privée : on garde juste l'état en mémoire */
  }
}

export function PrefsProvider({ children }) {
  const [lang, setLangState] = useState(() => (document.documentElement.lang === 'en' ? 'en' : 'fr'))
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const setLang = useCallback((l) => {
    setLangState(l)
    safeSet('lang', l)
  }, [])
  const toggleTheme = useCallback(() => {
    setDark((d) => {
      safeSet('theme', d ? 'light' : 'dark')
      return !d
    })
  }, [])

  const value = useMemo(() => {
    // tr() accepte une chaîne simple ou un objet { fr, en }
    const tr = (v) => {
      if (v == null) return ''
      if (typeof v === 'string') return v
      return v[lang] || v.fr || v.en || ''
    }
    return { lang, setLang, dark, toggleTheme, tr, ui: UI[lang] }
  }, [lang, setLang, dark, toggleTheme])

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export const usePrefs = () => useContext(PrefsContext)

/* ------------------------------------------------------------------ */
/* Résolution des images                                              */
/* ------------------------------------------------------------------ */

/* Par défaut : fichier de public/. L'espace perso peut fournir des images
   pas encore publiées (aperçu) via AssetContext. */
export const AssetContext = createContext(null)

export function useAsset() {
  const pending = useContext(AssetContext)
  return useCallback(
    (path) => {
      if (!path) return path
      if (pending?.[path]) return pending[path]
      if (/^(https?:|data:|blob:)/.test(path)) return path
      return `${import.meta.env.BASE_URL}${path}`
    },
    [pending],
  )
}
