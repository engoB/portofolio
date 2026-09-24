import projects from './data/projects.json'
import profile from './data/profile.json'
import { Hero, Nav, Toolbelt } from './components/Hero.jsx'
import Projects from './components/Projects.jsx'
import { Contact, Footer, Journey, Method, ProfileSection } from './components/Sections.jsx'

/*
 * Page unique. Aucune donnée n'est écrite ici :
 *  - src/data/projects.json → produits (Hub)
 *  - src/data/profile.json  → identité, CV, méthode IA
 * Les chiffres « produits » se recalculent à chaque ajout dans projects.json.
 */
const stats = [
  ...(profile.stats ?? []),
  { value: String(projects.length), label: 'produits conçus et mis en ligne' },
  { value: String(projects.filter((p) => p.status === 'production').length), label: 'en production aujourd’hui' },
]

export default function App() {
  return (
    <div className="grain min-h-screen overflow-x-clip">
      <a
        href="#projets"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[110] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-zinc-950"
      >
        Aller aux produits
      </a>
      <Nav />
      <main>
        <Hero stats={stats} />
        <Toolbelt />
        <ProfileSection />
        <Projects />
        <Journey />
        <Method />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
