import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2, X } from 'lucide-react'
import { ICONS } from '../components/ui.jsx'

/* Mise à jour immuable d'une valeur profonde : setIn(obj, ['a', 0, 'b'], v) */
export function setIn(obj, path, value) {
  if (!path.length) return value
  const [k, ...rest] = path
  const copy = Array.isArray(obj) ? [...obj] : { ...obj }
  copy[k] = setIn(obj?.[k], rest, value)
  return copy
}
export const getIn = (obj, path) => path.reduce((o, k) => o?.[k], obj)

export const inputCls =
  'w-full rounded-xl bg-bg px-3 py-2 text-sm text-fg ring-1 ring-line transition ring-inset placeholder:text-subtle focus:ring-2 focus:ring-sky-500 focus:outline-none'

export function Label({ children, hint }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-3 text-xs font-medium text-fg2">
      {children}
      {hint && <span className="font-normal text-subtle">{hint}</span>}
    </span>
  )
}

export function TextField({ label, hint, value, onChange, multiline, rows = 3, placeholder, type = 'text' }) {
  return (
    <label className="block">
      {label && <Label hint={hint}>{label}</Label>}
      {multiline ? (
        <textarea className={`${inputCls} resize-y leading-relaxed`} rows={rows} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inputCls} type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

/* Champ bilingue : { fr, en } côte à côte */
export function BiField({ label, hint, value, onChange, multiline, rows }) {
  const v = typeof value === 'string' ? { fr: value, en: '' } : value ?? { fr: '', en: '' }
  const set = (lang) => (text) => onChange({ ...v, [lang]: text })
  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}
      <div className="grid gap-2 md:grid-cols-2">
        {['fr', 'en'].map((l) => (
          <div key={l} className="relative">
            <span className="pointer-events-none absolute top-2 right-2.5 z-10 font-mono text-[10px] text-subtle uppercase">{l}</span>
            {multiline ? (
              <textarea className={`${inputCls} resize-y pr-8 leading-relaxed`} rows={rows ?? 3} value={v[l] ?? ''} onChange={(e) => set(l)(e.target.value)} />
            ) : (
              <input className={`${inputCls} pr-8`} value={v[l] ?? ''} onChange={(e) => set(l)(e.target.value)} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-1 py-1.5">
      <span>
        <span className="block text-sm text-fg">{label}</span>
        {hint && <span className="block text-xs text-subtle">{hint}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-fg/15 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function IconSelect({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(ICONS).map(([key, Icon]) => (
        <button
          key={key}
          type="button"
          title={key}
          onClick={() => onChange(key)}
          className={`grid size-8 place-items-center rounded-lg ring-1 ring-inset transition ${value === key ? 'bg-fg text-bg ring-fg' : 'text-muted ring-line hover:text-fg'}`}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}

/* Liste de mots-clés : chaîne ou { fr, en } */
export function TagInput({ label, hint, value = [], onChange }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const parts = draft
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length) onChange([...value, ...parts])
    setDraft('')
  }
  const text = (t) => (typeof t === 'string' ? t : t.fr || t.en)
  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-bg p-2 ring-1 ring-line ring-inset">
        {value.map((t, i) => (
          <span key={i} title={typeof t === 'string' ? '' : `EN : ${t.en}`} className="inline-flex items-center gap-1 rounded-full bg-fg/[0.06] py-1 pr-1 pl-2.5 text-xs text-fg2">
            {text(t)}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-4 place-items-center rounded-full hover:bg-fg/10" aria-label={`Retirer ${text(t)}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-0.5 text-sm text-fg placeholder:text-subtle focus:outline-none"
          value={draft}
          placeholder="Ajouter…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add()
            }
          }}
          onBlur={add}
        />
      </div>
    </div>
  )
}

/* Liste d'éléments éditables, réordonnables */
export function ListEditor({ items, onChange, render, template, addLabel = 'Ajouter', itemLabel }) {
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl bg-bg p-4 ring-1 ring-line ring-inset">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[11px] text-subtle">{itemLabel ? itemLabel(item, i) : `#${i + 1}`}</span>
            <div className="flex gap-1">
              <IconBtn onClick={() => move(i, -1)} label="Monter" disabled={i === 0}>
                <ArrowUp className="size-3.5" />
              </IconBtn>
              <IconBtn onClick={() => move(i, 1)} label="Descendre" disabled={i === items.length - 1}>
                <ArrowDown className="size-3.5" />
              </IconBtn>
              <IconBtn onClick={() => onChange(items.filter((_, j) => j !== i))} label="Supprimer" danger>
                <Trash2 className="size-3.5" />
              </IconBtn>
            </div>
          </div>
          <div className="space-y-3">{render(item, (v) => onChange(items.map((it, j) => (j === i ? v : it))), i)}</div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, structuredClone(template)])} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-fg2 ring-1 ring-line ring-inset hover:text-fg">
        <Plus className="size-4" /> {addLabel}
      </button>
    </div>
  )
}

export function IconBtn({ children, onClick, label, disabled, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`grid size-7 place-items-center rounded-lg ring-1 ring-line transition ring-inset disabled:opacity-30 ${danger ? 'text-rose-500 hover:bg-rose-500/10' : 'text-muted hover:bg-fg/5 hover:text-fg'}`}
    >
      {children}
    </button>
  )
}

/* Bloc repliable du formulaire */
export function Group({ title, hint, children, defaultOpen = true }) {
  return (
    <details open={defaultOpen} className="group/g rounded-3xl bg-card ring-1 ring-line ring-inset">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-medium text-fg">{title}</span>
          {hint && <span className="block text-xs text-subtle">{hint}</span>}
        </span>
        <ChevronDown className="size-4 shrink-0 text-subtle transition-transform group-open/g:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-line px-5 py-5">{children}</div>
    </details>
  )
}
