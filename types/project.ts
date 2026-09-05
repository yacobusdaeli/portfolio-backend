export interface TechBadge {
  name: string
  slug?: string
  color?: string
}

export interface GalleryItem {
  id: string
  title: string
  caption: string
  image_url: string
}

export interface ArchitectureLayer {
  layer: string
  tech: string[]
  description: string
}

export interface ChallengeItem {
  title: string
  problem: string
  solution: string
}

export interface Project {
  id: string
  slug: string
  title: string
  subtitle?: string
  description: string
  overview?: string
  background?: string
  badge?: string
  image_url?: string
  github_url?: string
  demo_url?: string
  technologies: TechBadge[]
  tags: string[]
  objectives?: string[]
  solutions?: string[]
  architecture?: ArchitectureLayer[]
  challenges?: ChallengeItem[]
  lessons_learned?: string[]
  gallery?: GalleryItem[]
  featured: boolean
  published: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>
export type ProjectUpdate = Partial<ProjectInsert>
