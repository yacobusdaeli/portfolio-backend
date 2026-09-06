'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ProjectForm from '@/components/admin/ProjectForm'
import type { Project } from '@/types/project'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadProject() {
      setLoading(true)
      const { data, error: fetchErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchErr) {
        setError(fetchErr.message || 'Project not found')
      } else {
        setProject(data as Project)
      }
      setLoading(false)
    }
    loadProject()
  }, [id])

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href="/admin/projects" 
          className="btn btn-ghost btn-sm"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '0.85rem' 
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Projects
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Edit Project {project ? `— ${project.title}` : ''}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
          Update project specifications, case study sections, and gallery.
        </p>
      </div>

      {loading && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading project data...
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171' }}>
          Failed to load project: {error}
        </div>
      )}

      {project && <ProjectForm mode="edit" initial={project} />}
    </div>
  )
}
