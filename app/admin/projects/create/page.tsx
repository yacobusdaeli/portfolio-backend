'use client'
import Link from 'next/link'
import ProjectForm from '@/components/admin/ProjectForm'

export default function CreateProjectPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href="/admin/projects" 
          style={{ 
            color: 'var(--text-secondary)', 
            textDecoration: 'none', 
            fontSize: '0.875rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.375rem', 
            marginBottom: '0.75rem' 
          }}
        >
          ? Back to Projects
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
