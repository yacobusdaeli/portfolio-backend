-- ========================================================
-- Portfolio Projects Database Schema for Supabase
-- ========================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT NOT NULL,
  overview        TEXT,
  background      TEXT,
  badge           TEXT,
  image_url       TEXT,
  github_url      TEXT,
  demo_url        TEXT,
  technologies    JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags            JSONB NOT NULL DEFAULT '[]'::jsonb,
  objectives      JSONB DEFAULT '[]'::jsonb,
  solutions       JSONB DEFAULT '[]'::jsonb,
  architecture    JSONB DEFAULT '[]'::jsonb,
  challenges      JSONB DEFAULT '[]'::jsonb,
  lessons_learned JSONB DEFAULT '[]'::jsonb,
  gallery         JSONB DEFAULT '[]'::jsonb,
  featured        BOOLEAN NOT NULL DEFAULT false,
  published       BOOLEAN NOT NULL DEFAULT true,
  order_index     INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(order_index ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- 3. Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Public can view published projects
DROP POLICY IF EXISTS "public_select_published" ON projects;
CREATE POLICY "public_select_published"
  ON projects FOR SELECT
  USING (published = true);

-- Authenticated users (admin) have full access
DROP POLICY IF EXISTS "authenticated_full_access" ON projects;
CREATE POLICY "authenticated_full_access"
  ON projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Storage Bucket Setup (execute in Supabase Dashboard or Storage API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view images
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');
-- CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images');
-- CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images');

-- 5. Updated_at auto trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
