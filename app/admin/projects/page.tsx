'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types/project'

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProjects = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  const togglePublish = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('projects').update({ published: !current, updated_at: new Date().toISOString() }).eq('id', id)
    setProjects(ps => ps.map(p => p.id === id ? { ...p, published: !current } : p))
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from('projects').update({ featured: !current, updated_at: new Date().toISOString() }).eq('id', id)
    setProjects(ps => ps.map(p => p.id === id ? { ...p, featured: !current } : p))
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Gagal menghapus project')
      }
      setProjects(ps => ps.filter(p => p.id !== deleteId))
      setDeleteId(null)
    } catch (err: unknown) {
      const e = err as { message?: string }
      alert(e.message || 'Gagal menghapus project')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="loading-spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  const toDelete = projects.find(p => p.id === deleteId)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project terdaftar</p>
        </div>
        <Link href="/admin/projects/create" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </Link>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Project</th>
                <th>Badge</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Tech Stack</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📂</div>
                    <div className="empty-state-title">Belum ada project</div>
                    <div className="empty-state-desc">Tambahkan project pertama Anda ke portfolio.</div>
                    <Link href="/admin/projects/create" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      New Project
                    </Link>
                  </div>
                </td></tr>
              )}
              {projects.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{idx + 1}</td>
                  <td>
                    <div className="td-title" style={{ maxWidth: 220 }}>{p.title}</div>
                    <div className="td-title-sub" style={{ fontFamily: 'monospace' }}>{p.slug}</div>
                  </td>
                  <td>
                    {p.badge && <span className="badge badge-accent">{p.badge}</span>}
                  </td>
                  <td>
                    <button
                      className={`badge ${p.published ? 'badge-published' : 'badge-draft'}`}
                      onClick={() => togglePublish(p.id, p.published)}
                      style={{ cursor: 'pointer', border: 'none', background: undefined }}
                      title="Toggle published"
                    >
                      {p.published ? '● Published' : '○ Draft'}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`badge ${p.featured ? 'badge-featured' : 'badge-draft'}`}
                      onClick={() => toggleFeatured(p.id, p.featured)}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Toggle featured"
                    >
                      {p.featured ? '★ Featured' : '☆ Normal'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 160 }}>
                      {(p.technologies ?? []).slice(0, 3).map(t => (
                        <span key={t.name} style={{
                          fontSize: 11, background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)', borderRadius: 5,
                          padding: '1px 6px', color: 'var(--text-muted)'
                        }}>{t.name}</span>
                      ))}
                      {(p.technologies ?? []).length > 3 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          +{p.technologies.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{p.order_index}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/admin/projects/edit/${p.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteId(p.id)}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h2 className="modal-title">Hapus Project</h2>
            <p className="modal-desc">
              Apakah Anda yakin ingin menghapus <strong>"{toDelete?.title}"</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Batal</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
