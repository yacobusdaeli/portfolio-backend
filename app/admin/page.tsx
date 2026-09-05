'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  total: number
  published: number
  draft: number
  featured: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0, featured: 0 })
  const [recentProjects, setRecentProjects] = useState<{ id: string; title: string; slug: string; published: boolean; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data } = await supabase
        .from('projects')
        .select('id, title, slug, published, featured, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        const all = data.length
        // Get all for full stats
        const { data: allData } = await supabase.from('projects').select('published, featured')
        const totalAll = allData?.length ?? 0
        const pub = allData?.filter(p => p.published).length ?? 0
        const feat = allData?.filter(p => p.featured).length ?? 0
        setStats({ total: totalAll, published: pub, draft: totalAll - pub, featured: feat })
        setRecentProjects(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div className="loading-spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview portfolio projects</p>
        </div>
        <Link href="/admin/projects/create" className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Projects</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-sub">Semua project</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Published</div>
          <div className="stat-value stat-accent">{stats.published}</div>
          <div className="stat-sub">Tampil di portfolio</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Draft</div>
          <div className="stat-value">{stats.draft}</div>
          <div className="stat-sub">Tidak ditampilkan</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Featured</div>
          <div className="stat-value">{stats.featured}</div>
          <div className="stat-sub">Proyek unggulan</div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Recent Projects</span>
          <Link href="/admin/projects" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📂</div>
                      <div className="empty-state-title">Belum ada project</div>
                      <div className="empty-state-desc">Tambahkan project pertama Anda.</div>
                    </div>
                  </td>
                </tr>
              )}
              {recentProjects.map(p => (
                <tr key={p.id}>
                  <td><div className="td-title">{p.title}</div></td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.slug}</span></td>
                  <td>
                    <span className={`badge ${p.published ? 'badge-published' : 'badge-draft'}`}>
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <Link href={`/admin/projects/edit/${p.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
