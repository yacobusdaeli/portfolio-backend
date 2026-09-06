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

async function uploadImageApi(file: File, folder: string = 'projects'): Promise<string> {
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg']
  const ext = file.name.split('.').pop()?.toLowerCase() || ''

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ukuran file melebihi batas maksimal 5MB')
  }
  if (!ALLOWED_TYPES.includes(file.type) || !['jpg', 'jpeg', 'png'].includes(ext)) {
    throw new Error('Format file tidak didukung. Hanya gambar format JPEG, JPG, dan PNG yang diperbolehkan')
  }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: fd,
  })
  const json = await res.json()
  if (!res.ok) {
    throw new Error(json.error || 'Gagal mengupload gambar')
  }
  return json.url as string
}

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
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <input className="form-input" style={{ flex: '1 1 120px' }} placeholder="Name (React)" value={t.name} onChange={e => update(i, 'name', e.target.value)} />
            <input className="form-input" style={{ flex: '1 1 120px' }} placeholder="Slug (react)" value={t.slug ?? ''} onChange={e => update(i, 'slug', e.target.value)} />
            <input className="form-input" style={{ width: 100, fontFamily: 'monospace', fontSize: 12 }} placeholder="Color hex" value={t.color ?? ''} onChange={e => update(i, 'color', e.target.value)} />
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

function GalleryField({ value, onChange }: {
  value: { id: string; title: string; caption: string; image_url: string }[]
  onChange: (v: typeof value) => void
}) {
  const add = () => onChange([...value, { id: `gallery-${Date.now()}`, title: '', caption: '', image_url: '' }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const update = (i: number, field: string, val: string) => {
    const n = [...value]; n[i] = { ...n[i], [field]: val }; onChange(n)
  }
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const uploadGalleryImage = async (i: number, file: File) => {
    try {
      setUploadingIdx(i)
      const localPreview = URL.createObjectURL(file)
      update(i, 'image_url', localPreview)
      const url = await uploadImageApi(file, 'gallery')
      update(i, 'image_url', url)
    } catch (err: unknown) {
      const e = err as { message?: string }
      alert('Upload screenshot gagal: ' + (e.message || 'Terjadi kesalahan'))
    } finally {
      setUploadingIdx(null)
    }
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
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRefs.current[i]?.click()} disabled={uploadingIdx === i}>
                  {uploadingIdx === i ? 'Uploading...' : 'Ganti'}
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRefs.current[i]?.click()} disabled={uploadingIdx === i}>
                {uploadingIdx === i ? 'Uploading...' : 'Upload Screenshot'}
              </button>
            )}
            <input
              ref={el => { fileRefs.current[i] = el }}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
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

function PortfolioLivePreview({ form }: { form: any }) {
  const [previewTab, setPreviewTab] = useState<'card' | 'detail'>('card')

  return (
    <div className="preview-portfolio-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${previewTab === 'card' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPreviewTab('card')}
          >
            📇 Preview: Project Card (Grid)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${previewTab === 'detail' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPreviewTab('detail')}
          >
            📄 Preview: Case Study Detail
          </button>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Pratinjau visual interaktif sesuai data formulir
        </span>
      </div>

      {/* Simulated Browser Frame */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ 
          padding: '10px 16px', 
          background: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <div style={{ 
            flex: 1, 
            maxWidth: 420, 
            margin: '0 auto', 
            background: 'var(--card-bg)', 
            borderRadius: 6, 
            padding: '3px 12px', 
            fontSize: 11, 
            fontFamily: 'monospace', 
            color: 'var(--text-muted)',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {previewTab === 'card' 
              ? 'https://yacobusdaeli.com/#projects' 
              : `https://yacobusdaeli.com/projects/${form.slug || 'slug'}`}
          </div>
        </div>

        <div style={{ padding: '32px 24px', background: 'var(--bg)' }}>
          {previewTab === 'card' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="preview-section-title" style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
                Simulasi Kartu Proyek di Grid Portfolio
              </div>
              <div className="preview-card" style={{ width: '100%' }}>
                <div className="preview-card-img-wrap">
                  {form.image_url ? (
                    <img src={form.image_url} alt={form.title || 'Project'} className="preview-card-img" />
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>🖼️</div>
                      Belum ada gambar utama
                    </div>
                  )}
                  {form.badge && (
                    <div style={{ position: 'absolute', top: 12, left: 12 }}>
                      <span className="preview-badge" style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', backdropFilter: 'blur(4px)', borderColor: 'rgba(255,255,255,0.2)' }}>
                        {form.badge}
                      </span>
                    </div>
                  )}
                  {form.featured && (
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      <span className="preview-badge" style={{ background: 'var(--accent)', color: '#fff' }}>
                        ★ Featured
                      </span>
                    </div>
                  )}
                </div>
                <div className="preview-card-body">
                  <h3 className="preview-card-title">{form.title || 'Judul Project Belum Diisi'}</h3>
                  {form.subtitle && <p className="preview-card-subtitle">{form.subtitle}</p>}
                  <p className="preview-card-desc">
                    {form.description || 'Deskripsi singkat project akan tampil di sini...'}
                  </p>

                  {form.technologies && form.technologies.length > 0 && (
                    <div className="preview-chips-wrap">
                      {form.technologies.map((t: any, idx: number) => (
                        <span key={idx} className="preview-tech-chip">
                          <span 
                            className="preview-chip-dot" 
                            style={{ background: t.color ? (t.color.startsWith('#') ? t.color : `#${t.color}`) : 'var(--accent)' }} 
                          />
                          {t.name || 'Tech'}
                        </span>
                      ))}
                    </div>
                  )}

                  {form.tags && form.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {form.tags.map((tg: string, idx: number) => (
                        <span key={idx} style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4 }}>
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="preview-actions">
                    {form.demo_url && (
                      <a href={form.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                        Live Demo ↗
                      </a>
                    )}
                    {form.github_url && (
                      <a href={form.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                        GitHub ↗
                      </a>
                    )}
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreviewTab('detail')} style={{ marginLeft: 'auto' }}>
                      Case Study →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="preview-detail-view" style={{ background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span className="preview-badge">{form.badge || 'Case Study'}</span>
                  {form.featured && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>★ Featured Project</span>}
                </div>

                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>
                  {form.title || 'Judul Project'}
                </h1>
                {form.subtitle && (
                  <p style={{ fontSize: 15, color: 'var(--accent)', fontWeight: 500, marginBottom: 20 }}>
                    {form.subtitle}
                  </p>
                )}

                {form.image_url && (
                  <div style={{ width: '100%', height: 320, borderRadius: 14, overflow: 'hidden', marginBottom: 24, background: 'var(--bg-tertiary)' }}>
                    <img src={form.image_url} alt={form.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div className="preview-detail-grid">
                  {form.overview && (
                    <div className="admin-card" style={{ padding: 20 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>📌 Overview</h4>
                      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{form.overview}</p>
                    </div>
                  )}
                  {form.background && (
                    <div className="admin-card" style={{ padding: 20 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>🎯 Background & Problem</h4>
                      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{form.background}</p>
                    </div>
                  )}
                </div>

                {form.objectives && form.objectives.filter(Boolean).length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>🚀 Key Objectives</h4>
                    <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.7 }}>
                      {form.objectives.filter(Boolean).map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {form.solutions && form.solutions.filter(Boolean).length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>💡 Solutions Implemented</h4>
                    <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.7 }}>
                      {form.solutions.filter(Boolean).map((sol: string, i: number) => (
                        <li key={i}>{sol}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {form.architecture && form.architecture.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>🏗️ System Architecture</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                      {form.architecture.map((arch: any, i: number) => (
                        <div key={i} className="admin-card" style={{ padding: 14 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{arch.layer}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--accent)', marginBottom: 6 }}>{(arch.tech || []).join(', ')}</div>
                          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{arch.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.challenges && form.challenges.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>⚡ Challenges & Solutions</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                      {form.challenges.map((c: any, i: number) => (
                        <div key={i} className="admin-card" style={{ padding: 14 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 6 }}>{c.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 6 }}><strong>Problem:</strong> {c.problem}</div>
                          <div style={{ fontSize: 12, color: 'var(--accent)' }}><strong>Solution:</strong> {c.solution}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.lessons_learned && form.lessons_learned.filter(Boolean).length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>📖 Lessons Learned</h4>
                    <ul style={{ paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.7 }}>
                      {form.lessons_learned.filter(Boolean).map((les: string, i: number) => (
                        <li key={i}>{les}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {form.gallery && form.gallery.filter((g: any) => g.image_url).length > 0 && (
                  <div style={{ marginTop: 28 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>📸 Gallery Screenshots</h4>
                    <div className="preview-gallery-grid">
                      {form.gallery.filter((g: any) => g.image_url).map((g: any, i: number) => (
                        <div key={i} className="preview-gallery-item">
                          <img src={g.image_url} alt={g.title} />
                          <div className="preview-gallery-info">
                            <div className="preview-gallery-title">{g.title || `Screenshot ${i + 1}`}</div>
                            {g.caption && <div className="preview-gallery-cap">{g.caption}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProjectForm({ initial, mode }: ProjectFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form')
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
    order_index: (initial?.order_index ?? 0) as number | '',
  })

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  const uploadMainImage = async (file: File) => {
    setImageUploading(true)
    try {
      const localPreview = URL.createObjectURL(file)
      set('image_url', localPreview)
      const url = await uploadImageApi(file, 'main')
      set('image_url', url)
    } catch (err: unknown) {
      const e = err as { message?: string }
      alert('Upload gambar utama gagal: ' + (e.message || 'Terjadi kesalahan'))
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = mode === 'create' ? '/api/projects' : `/api/projects/${initial!.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const payload = {
        ...form,
        order_index: form.order_index === '' ? 0 : Number(form.order_index),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.issues && Array.isArray(data.issues)) {
          const issuesMsg = data.issues.map((issue: { path?: (string|number)[]; message?: string }) => {
            const field = issue.path && issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
            return `${field}${issue.message || 'Invalid field'}`
          }).join(', ')
          throw new Error(issuesMsg || data.error || 'Validasi gagal')
        }
        throw new Error(data.error || 'Gagal menyimpan project')
      }

      router.push('/admin/projects')
      router.refresh()
    } catch (err: unknown) {
      const e = err as { message?: string }
      setError(e.message ?? 'Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Mode Switcher Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div className="form-mode-tabs" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`form-mode-tab ${viewMode === 'form' ? 'active' : ''}`}
            onClick={() => setViewMode('form')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Form
          </button>
          <button
            type="button"
            className={`form-mode-tab ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Live Portfolio Preview
          </button>
        </div>

        {viewMode === 'preview' ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setViewMode('form')}>
            ← Kembali ke Form Edit
          </button>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setViewMode('preview')}>
            👁️ Preview Tampilan
          </button>
        )}
      </div>

      {viewMode === 'preview' ? (
        <PortfolioLivePreview form={form} />
      ) : (
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
            <input 
              id="order_index" 
              type="number" 
              className="form-input" 
              value={form.order_index} 
              onChange={e => {
                const val = e.target.value
                set('order_index', val === '' ? '' : Number(val))
              }} 
              min={0} 
            />
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
                <div className="image-uploader-hint">JPEG, JPG, PNG • Max 5MB</div>
              </div>
            </div>
          )}
          <input ref={mainImageRef} type="file" accept="image/jpeg,image/png,image/jpg" style={{ display: 'none' }}
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
          <GalleryField value={form.gallery} onChange={v => set('gallery', v)} />
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
    )}
  </div>
  )
}
