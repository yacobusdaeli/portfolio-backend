import { z } from 'zod'

const TechBadgeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  color: z.string().optional(),
})

const GalleryItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  caption: z.string(),
  image_url: z.string().url().or(z.string().startsWith('/')),
})

const ArchitectureLayerSchema = z.object({
  layer: z.string().min(1),
  tech: z.array(z.string()),
  description: z.string(),
})

const ChallengeItemSchema = z.object({
  title: z.string().min(1),
  problem: z.string().min(1),
  solution: z.string().min(1),
})

export const ProjectInsertSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  title: z.string().min(1, 'Title wajib diisi'),
  subtitle: z.string().optional(),
  description: z.string().min(1, 'Description wajib diisi'),
  overview: z.string().optional(),
  background: z.string().optional(),
  badge: z.string().optional(),
  image_url: z.string().optional(),
  github_url: z.string().url().optional().or(z.literal('')),
  demo_url: z.string().url().optional().or(z.literal('')),
  technologies: z.array(TechBadgeSchema).default([]),
  tags: z.array(z.string()).default([]),
  objectives: z.array(z.string()).optional(),
  solutions: z.array(z.string()).optional(),
  architecture: z.array(ArchitectureLayerSchema).optional(),
  challenges: z.array(ChallengeItemSchema).optional(),
  lessons_learned: z.array(z.string()).optional(),
  gallery: z.array(GalleryItemSchema).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order_index: z.number().int().default(0),
})

export const ProjectUpdateSchema = ProjectInsertSchema.partial()

export const ProjectPatchSchema = z.object({
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  order_index: z.number().int().optional(),
})

export type ProjectInsertInput = z.infer<typeof ProjectInsertSchema>
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>
export type ProjectPatchInput = z.infer<typeof ProjectPatchSchema>
