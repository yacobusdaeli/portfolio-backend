'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types/project'

interface ProjectFormProps {
  initial?: Partial<Project>
  mode: 'create' | 'edit'
}

type ArrayField = 'objectives' | 'solutions' | 'tags' | 'lessons_learned'

function TagInput({ label, value, onChange, hint }: {
  label: string; value: string[]; onChange: (v: string[]) => void; hint?: string
}) {
  const [input, setInput] = useState('')
  const addTag = () => {
    const t = input.trim()
    if (t && !value.includes(t)) { onChange([...value, t]); setInput('') }
  }
  const removeTag = (tag: string) => onChange(value.filter(t => t !== tag))
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="tag-input-wrap" onClick={() => {}}>
        {value.map(t => (
          <span key={t} className="tag-chip">
            {t}
            <button className="tag-remove" type="button" onClick={() => removeTag(t)}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
        ))}
        <input
          className="tag-input-field"
          placeholder="Ketik lalu Enter…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          onBlur={addTag}
        />
      </div>
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  )
}

function ArrayStringField({ label, value, onChange, placeholder }: {
  label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const update = (idx: number, val: string) => { const n = [...value]; n[idx] = val; onChange(n) }
  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))
  const add = () => onChange([...value, ''])
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="array-field">
        {value.map((v, i) => (
          <div key={i} className="array-field-row">
            <input
              className="form-input"
              value={v}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder ?? `Item ${i + 1}`}
            />
            <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => remove(i)} title="Remove">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
        <button type="button" className="array-add-btn" onClick={add}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah item
        </button>
      </div>
    </div>
  )
}

function TechStackField({ value, onChange }: { value: { name: string; slug?: string; color?: string }[]; onChange: (v: typeof value) => void }) {
  const add = () => onChange([...value, { name: '', slug: '', color: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, field: string, val: string) => {
    const n = [...value]; n[i] = { ...n[i], [field]: val }; onChange(n)
  }
  return (
    <div className="form-group">
      <label className="form-label">Tech Stack</label>
      <div className="array-field">
        {value.map((t, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: 8, alignItems: 'center' }}>
            <input className="form-input" placeholder="Name (React)" value={t.name} onChange={e => update(i, 'name', e.target.value)} />
            <input className="form-input" placeholder="Slug (react)" value={t.slug ?? ''} onChange={e => update(i, 'slug', e.target.value)} />
            <input className="form-input" placeholder="Color hex" value={t.color ?? ''} onChange={e => update(i, 'color', e.target.value)} style={{ fontFamily: 'monospace', fontSize: 12 }} />
            <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => remove(i)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
        <button type="button" className="array-add-btn" onClick={add}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah teknologi
        </button>
      </div>
    </div>
  )
}

function ArchitectureField({ value, onChange }: { value: { layer: string; tech: string[]; description: string }[]; onChange: (v: typeof value) => void }) {
  const add = () => onChange([...value, { layer: '', tech: [], description: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, field: string, val: string | string[]) => {
    const n = [...value]; n[i] = { ...n[i], [field]: val }; onChange(n)
  }
  return (
    <div className="form-group">
      <label className="form-label">System Architecture</label>
      <div className="array-field">
        {value.map((a, i) => (
          <div key={i} className="admin-card" style={{ padding: 14, marginBottom: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
              <input className="form-input" placeholder="Layer name (e.g. Client Layer)" value={a.layer} onChange={e => update(i, 'layer', e.target.value)} />
              <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => remove(i)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <input className="form-input" placeholder="Technologies (comma separated)" value={a.tech.join(', ')} onChange={e => update(i, 'tech', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} style={{ marginBottom: 8 }} />
            <textarea className="form-textarea" placeholder="Deskripsi layer ini…" value={a.description} onChange={e => update(i, 'description', e.target.value)} style={{ minHeight: 60 }} />
          </div>
        ))}
        <button type="button" className="array-add-btn" onClick={add}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah layer
        </button>
      </div>
    </div>
  )
}

function ChallengesField({ value, onChange }: { value: { title: string; problem: string; solution: string }[]; onChange: (v: typeof value) => void }) {
  const add = () => onChange([...value, { title: '', problem: '', solution: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, field: string, val: string) => {
    const n = [...value]; n[i] = { ...n[i], [field]: val }; onChange(n)
  }
  return (
    <div className="form-group">
      <label className="form-label">Challenges & Solutions</label>
      <div className="array-field">
        {value.map((c, i) => (
          <div key={i} className="admin-card" style={{ padding: 14, marginBottom: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
              <input className="form-input" placeholder="Challenge title" value={c.title} onChange={e => update(i, 'title', e.target.value)} />
              <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => remove(i)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <textarea className="form-textarea" placeholder="Problem description…" value={c.problem} onChange={e => update(i, 'problem', e.target.value)} style={{ minHeight: 60, marginBottom: 8 }} />
            <textarea className="form-textarea" placeholder="Solution description…" value={c.solution} onChange={e => update(i, 'solution', e.target.value)} style={{ minHeight: 60 }} />
          </div>
        ))}
        <button type="button" className="array-add-btn" onClick={add}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah challenge
        </button>
      </div>
    </div>
  )
}

function GalleryField({ projectId, value, onChange }: {
  projectId?: string
  value: { id: string; title: string; caption: string; image_url: string }[]
  onChange: (v: typeof value) => void
}) {
  const add = () => onChange([...value, { id: `gallery-${Date.now()}`, title: '', caption: '', image_url: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, field: string, val: string) => {
    const n = [...value]; n[i] = { ...n[i], [field]: val }; onChange(n)
  }
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  const uploadGalleryImage = async (i: number, file: File) => {
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'png'
    const identifier = projectId || `proj-${Date.now()}`
    const galleryId = value[i].id || `g-${i}-${Date.now()}`
    const path = `gallery/${identifier}-${galleryId}.${ext}`
    const { error } = await supabase.storage.from('project-images').upload(path, file, { upsert: true })
    if (error) return alert('Upload gagal: ' + error.message)
    const { data } = supabase.storage.from('project-images').getPublicUrl(path)
    update(i, 'image_url', data.publicUrl)
  }

  return (
    <div className="form-group">
      <label className="form-label">Gallery Screenshots</label>
      <div className="array-field">
        {value.map((g, i) => (
          <div key={i} className="admin-card" style={{ padding: 14, marginBottom: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginBottom: 8 }}>
              <input className="form-input" placeholder="Screenshot title" value={g.title} onChange={e => update(i, 'title', e.target.value)} />
              <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => remove(i)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <input className="form-input" placeholder="Caption deskripsi…" value={g.caption} onChange={e => update(i, 'caption', e.target.value)} style={{ marginBottom: 8 }} />
            {g.image_url ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <img src={g.image_url} alt={g.title} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{g.image_url}</div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRefs.current[i]?.click()}>Ganti</button>
              </div>
            ) : (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRefs.current[i]?.click()}>
                Upload Screenshot
              </button>
            )}
            <input
              ref={el => { fileRefs.current[i] = el }}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadGalleryImage(i, f) }}
            />
          </div>
        ))}
        <button type="button" className="array-add-btn" onClick={add}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah screenshot
        </button>
      </div>
    </div>
  )
}

export default function ProjectForm({ initial, mode }: ProjectFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const mainImageRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    slug: initial?.slug ?? '',
    title: initial?.title ?? '',
    subtitle: initial?.subtitle ?? '',
    description: initial?.description ?? '',
    overview: initial?.overview ?? '',
    background: initial?.background ?? '',
    badge: initial?.badge ?? '',
    image_url: initial?.image_url ?? '',
    github_url: initial?.github_url ?? '',
    demo_url: initial?.demo_url ?? '',
    technologies: initial?.technologies ?? [],
    tags: initial?.tags ?? [],
    objectives: initial?.objectives ?? [],
    solutions: initial?.solutions ?? [],
    architecture: initial?.architecture ?? [],
    challenges: initial?.challenges ?? [],
    lessons_learned: initial?.lessons_learned ?? [],
    gallery: initial?.gallery ?? [],
    featured: initial?.featured ?? false,
    published: initial?.published ?? true,
    order_index: initial?.order_index ?? 0,
  })

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const uploadMainImage = async (file: File) => {
    setImageUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop() || 'png'
    const identifier = initial?.id || (form.slug ? form.slug : `proj-${Date.now()}`)
    const path = `${identifier}-main.${ext}`
    const { error: upErr } = await supabase.storage.from('project-images').upload(path, file, { upsert: true })
    if (upErr) { alert('Upload failed: ' + upErr.message); setImageUploading(false); return }
    const { data } = supabase.storage.from('project-images').getPublicUrl(path)
    set('image_url', data.publicUrl)
    setImageUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const payload = { ...form, updated_at: new Date().toISOString() }

      if (mode === 'create') {
        const { error: err } = await supabase.from('projects').insert(payload)
        if (err) throw err
        router.push('/admin/projects')
      } else {
        const { error: err } = await supabase.from('projects').update(payload).eq('id', initial!.id!)
        if (err) throw err
        router.push('/admin/projects')
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e.message ?? 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="login-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* ── BASIC INFO ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-header"><span className="admin-card-title">Basic Information</span></div>
        <div className="admin-card-body">
          <div className="form-grid form-row-2" style={{ marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="slug">Slug <span className="required">*</span></label>
              <input id="slug" className="form-input" placeholder="arventa-pms" value={form.slug}
                onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                required style={{ fontFamily: 'monospace' }} />
              <span className="form-hint">URL-friendly identifier. Hanya huruf kecil, angka, dan -</span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="badge">Badge / Category</label>
              <input id="badge" className="form-input" placeholder="SaaS PMS" value={form.badge} onChange={e => set('badge', e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="title">Title <span className="required">*</span></label>
            <input id="title" className="form-input" placeholder="ARVENTRA — Property Management System" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="subtitle">Subtitle</label>
            <input id="subtitle" className="form-input" placeholder="Cloud Property & Tenant Management Platform" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label" htmlFor="description">Description <span className="required">*</span></label>
            <textarea id="description" className="form-textarea" placeholder="Deskripsi singkat project (1-2 paragraf)…" value={form.description} onChange={e => set('description', e.target.value)} required style={{ minHeight: 80 }} />
          </div>
          <div className="form-grid form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="github_url">GitHub URL</label>
              <input id="github_url" className="form-input" placeholder="https://github.com/…" value={form.github_url} onChange={e => set('github_url', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="demo_url">Demo URL</label>
              <input id="demo_url" className="form-input" placeholder="https://…" value={form.demo_url} onChange={e => set('demo_url', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SETTINGS ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-header"><span className="admin-card-title">Settings</span></div>
        <div className="admin-card-body">
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginBottom: 16 }}>
            <label className="toggle-wrap">
              <label className="toggle">
                <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
              <span className="toggle-label">Published (tampil di portfolio)</span>
            </label>
            <label className="toggle-wrap">
              <label className="toggle">
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                <span className="toggle-slider" />
              </label>
              <span className="toggle-label">Featured (project unggulan)</span>
            </label>
          </div>
          <div className="form-group" style={{ maxWidth: 160 }}>
            <label className="form-label" htmlFor="order_index">Display Order</label>
            <input id="order_index" type="number" className="form-input" value={form.order_index} onChange={e => set('order_index', parseInt(e.target.value) || 0)} min={0} />
            <span className="form-hint">Urutan tampil (0 = pertama)</span>
          </div>
        </div>
      </div>

      {/* ── MAIN IMAGE ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-header"><span className="admin-card-title">Main Image</span></div>
        <div className="admin-card-body">
          {form.image_url ? (
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <img src={form.image_url} alt="Preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
              <div style={{ flex: 1 }}>
                <input className="form-input" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="Image URL" style={{ marginBottom: 8 }} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => mainImageRef.current?.click()} disabled={imageUploading}>
                  {imageUploading ? 'Uploading...' : 'Upload Gambar Baru'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input className="form-input" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="Masukkan URL gambar atau upload…" style={{ marginBottom: 10 }} />
              <div className="image-uploader" onClick={() => mainImageRef.current?.click()}>
                <div className="image-uploader-icon">🖼️</div>
                <div className="image-uploader-text">{imageUploading ? 'Uploading…' : 'Klik untuk upload gambar utama'}</div>
                <div className="image-uploader-hint">PNG, JPG, WebP • Max 5MB</div>
              </div>
            </div>
          )}
          <input ref={mainImageRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadMainImage(f) }} />
        </div>
      </div>

      {/* ── TECH & TAGS ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-header"><span className="admin-card-title">Tech Stack & Tags</span></div>
        <div className="admin-card-body form-grid">
          <TechStackField value={form.technologies} onChange={v => set('technologies', v)} />
          <TagInput label="Tags" value={form.tags} onChange={v => set('tags', v)} hint="Tekan Enter untuk menambahkan tag" />
        </div>
      </div>

      {/* ── CASE STUDY ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card-header"><span className="admin-card-title">Case Study Content</span></div>
        <div className="admin-card-body form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="overview">Overview</label>
            <textarea id="overview" className="form-textarea" value={form.overview} onChange={e => set('overview', e.target.value)} placeholder="Deskripsi lengkap project…" style={{ minHeight: 100 }} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="background">Background</label>
            <textarea id="background" className="form-textarea" value={form.background} onChange={e => set('background', e.target.value)} placeholder="Latar belakang / konteks masalah…" style={{ minHeight: 100 }} />
          </div>
          <ArrayStringField label="Objectives" value={form.objectives} onChange={v => set('objectives', v)} placeholder="Tujuan project…" />
          <ArrayStringField label="Solutions" value={form.solutions} onChange={v => set('solutions', v)} placeholder="Solusi yang diterapkan…" />
          <ArchitectureField value={form.architecture} onChange={v => set('architecture', v)} />
          <ChallengesField value={form.challenges} onChange={v => set('challenges', v)} />
          <ArrayStringField label="Lessons Learned" value={form.lessons_learned} onChange={v => set('lessons_learned', v)} placeholder="Pembelajaran yang didapat…" />
          <GalleryField projectId={initial?.id} value={form.gallery} onChange={v => set('gallery', v)} />
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingBottom: 40 }}>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Batal</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? (
            <><span className="loading-spinner" style={{ width: 14, height: 14 }} />{mode === 'create' ? 'Menyimpan...' : 'Memperbarui...'}</>
          ) : mode === 'create' ? 'Simpan Project' : 'Update Project'}
        </button>
      </div>
    </form>
  )
}
