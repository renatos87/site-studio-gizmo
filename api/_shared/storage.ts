import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'project-images';

export function getSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

export function decodeBase64Image(dataUrl: string) {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;
  return {
    contentType: matches[1],
    buffer: Buffer.from(matches[2], 'base64'),
    extension: matches[1].split('/')[1] || 'png',
  };
}
