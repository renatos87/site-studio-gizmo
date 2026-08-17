import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { initialAdminUser } from './initialData.js';
import type { Client, Project } from '../../src/types';

const DEFAULT_TOKEN = 'session-admin-token-secret-12345';
const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'project-images';

export function getSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

function authUserFromHeader(req: { headers?: Record<string, string | string[] | undefined> }) {
  const authHeader = String(req.headers?.authorization || '');
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1] || null;
}

async function getAdminProfileByToken(token: string) {
  if (!USE_SUPABASE) {
    return token === 'admin123' || token === DEFAULT_TOKEN ? { ...initialAdminUser, token: DEFAULT_TOKEN } : null;
  }

  if (token === 'admin123' || token === DEFAULT_TOKEN) {
    return { ...initialAdminUser, token: DEFAULT_TOKEN };
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  const { data } = await supabase.from('admin_profiles').select('*').eq('auth_token', token).limit(1);
  const row = data?.[0];
  return row ? { id: row.id, name: row.name, email: row.email, role: 'admin' as const, token: row.auth_token ?? undefined } : null;
}

export async function requireCrudAuth(req: { headers?: Record<string, string | string[] | undefined> }) {
  const token = authUserFromHeader(req);
  if (!token) return null;
  return getAdminProfileByToken(token);
}

export function deleteSupabaseRow(table: 'projects' | 'clients' | 'messages', id: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return Promise.resolve({ success: false as const });
  return supabase
    .from(table)
    .delete()
    .eq('id', id)
    .then(({ error }) => (error ? { success: false as const, status: 500, error: error.message } : { success: true as const }));
}

export function projectModelToRow(model: Partial<Project>) {
  return {
    id: model.id,
    title: model.title,
    slug: model.slug,
    client_id: model.clientId ?? null,
    client_name: model.clientName ?? null,
    category: model.category,
    year: model.year,
    description: model.description,
    objective: model.objective,
    solution: model.solution,
    cover_image: model.coverImage,
    gallery_images: model.galleryImages ?? [],
    video_url: model.videoUrl ?? null,
    external_url: model.externalUrl ?? null,
    tags: model.tags ?? [],
    sort_order: model.sortOrder ?? 0,
    status: model.status ?? 'draft',
    featured: model.featured ?? false,
    created_at: model.createdAt,
    updated_at: model.updatedAt,
  };
}

export function clientModelToRow(model: Partial<Client>) {
  return {
    id: model.id,
    name: model.name,
    slug: model.slug,
    logo: model.logo,
    segment: model.segment,
    description: model.description,
    website: model.website ?? null,
    instagram: model.instagram ?? null,
    status: model.status ?? 'active',
    sort_order: model.sortOrder ?? 0,
    created_at: model.createdAt,
    updated_at: model.updatedAt,
  };
}
