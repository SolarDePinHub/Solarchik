/*
# Create vote-screenshots Storage bucket

## Purpose
Provides a Supabase Storage bucket where players can upload
screenshot images of their Binance vote as proof for the 100,000 kW bonus.

## Changes

### Storage bucket
- Creates `vote-screenshots` public bucket (max 5 MB per file, images only)

### Storage RLS policies
- Anon + authenticated users can INSERT (upload) into this bucket
- Anon + authenticated users can SELECT (read) from this bucket
  — bucket is public, so images are viewable by the admin panel too

## Notes
1. File paths follow `{player_id}/{timestamp}.{ext}` so uploads are
   namespaced per player and never collide.
2. Public URLs are generated client-side via
   `supabase.storage.from('vote-screenshots').getPublicUrl(path)`
   and stored in the existing `screenshot_submissions.screenshot_url` column —
   no schema change needed.
3. Bucket is set to public so the admin panel can display images
   without needing authenticated tokens.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vote-screenshots',
  'vote-screenshots',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "vote_screenshots_insert" ON storage.objects;
CREATE POLICY "vote_screenshots_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'vote-screenshots');

DROP POLICY IF EXISTS "vote_screenshots_select" ON storage.objects;
CREATE POLICY "vote_screenshots_select" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'vote-screenshots');
