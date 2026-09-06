'use client'
import Link from 'next/link'
import ProjectForm from '@/components/admin/ProjectForm'

export default function CreateProjectPage() {
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
          Add New Project
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
          Fill in details, upload images, and configure the project case study.
        </p>
      </div>

      <ProjectForm mode="create" />
    </div>
  )
}
