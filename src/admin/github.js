/*
 * Mini-client GitHub pour l'espace perso.
 * Le jeton (fine-grained, limité au dépôt, permission « Contents: read & write »)
 * ne quitte jamais le navigateur : il n'est envoyé qu'à api.github.com.
 */
const API = 'https://api.github.com'

const decodeBase64Utf8 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), (c) => c.charCodeAt(0)))

export function createClient({ token, owner, name, branch }) {
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const req = async (path, { method = 'GET', body } = {}) => {
    const res = await fetch(`${API}/repos/${owner}/${name}${path}`, {
      method,
      headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      const err = new Error(`GitHub ${res.status} — ${text.slice(0, 160)}`)
      err.status = res.status
      throw err
    }
    return res.status === 204 ? null : res.json()
  }

  return {
    /* Vérifie le jeton et le droit d'écriture sur le dépôt */
    async check() {
      const repo = await req('')
      if (!repo.permissions?.push) throw new Error("Ce jeton peut lire le dépôt mais pas y écrire (permission « Contents » en lecture et écriture requise).")
      return repo
    },

    async readJson(path) {
      const file = await req(`/contents/${path}?ref=${encodeURIComponent(branch)}`)
      return JSON.parse(decodeBase64Utf8(file.content))
    },

    /*
     * Publie plusieurs fichiers en UN seul commit (donc un seul déploiement).
     * files : [{ path, text }] ou [{ path, base64 }]
     */
    async commit(files, message) {
      const ref = await req(`/git/ref/heads/${branch}`)
      const head = ref.object.sha
      const parent = await req(`/git/commits/${head}`)
      const tree = []
      for (const f of files) {
        const blob = await req('/git/blobs', {
          method: 'POST',
          body: f.base64 != null ? { content: f.base64, encoding: 'base64' } : { content: f.text, encoding: 'utf-8' },
        })
        tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha })
      }
      const newTree = await req('/git/trees', { method: 'POST', body: { base_tree: parent.tree.sha, tree } })
      const commit = await req('/git/commits', { method: 'POST', body: { message, tree: newTree.sha, parents: [head] } })
      await req(`/git/refs/heads/${branch}`, { method: 'PATCH', body: { sha: commit.sha } })
      return commit
    },
  }
}

/* Redimensionne une image dans le navigateur et la convertit en WebP */
export async function toWebp(file, maxWidth) {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, maxWidth / img.naturalWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return { dataUrl: canvas.toDataURL('image/webp', 0.82), width: canvas.width, height: canvas.height }
  } finally {
    URL.revokeObjectURL(url)
  }
}
