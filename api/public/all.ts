import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initialClients, initialProjects, initialSettings } from '../_shared/initialData.js';
import type { Client, Project, SiteSettings } from '../../src/types';

type DbTable = 'settings' | 'projects' | 'clients';

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  client_id?: string | null;
  client_name?: string | null;
  category: Project['category'];
  year: string;
  description: string;
  objective: string;
  solution: string;
  cover_image: string;
  gallery_images: Project['galleryImages'];
  video_url?: string | null;
  external_url?: string | null;
  tags: string[];
  sort_order: number;
  status: Project['status'];
  featured: boolean;
  created_at: string;
  updated_at: string;
};

type ClientRow = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  segment: string;
  description: string;
  website?: string | null;
  instagram?: string | null;
  status: Client['status'];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type SettingsRow = {
  id: number;
  personal_info: SiteSettings['personalInfo'];
  contact_info: SiteSettings['contactInfo'];
  social_links: SiteSettings['socialLinks'];
  seo_settings: SiteSettings['seoSettings'];
  appearance: SiteSettings['appearance'];
};

const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_REST_URL = USE_SUPABASE ? `${SUPABASE_URL}/rest/v1` : '';

function toHeaderValue(body: string | undefined) {
  return body
    ? { 'Content-Type': 'application/json', Prefer: 'return=representation' }
    : { Prefer: 'return=representation' };
}

async function supabaseRequest<T>(
  table: DbTable,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    query?: string;
    body?: unknown;
    prefer?: string;
  } = {},
): Promise<T | null> {
  if (!USE_SUPABASE) return null;

  const { method = 'GET', query = '', body, prefer } = options;
  const response = await fetch(`${SUPABASE_REST_URL}/${table}${query}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY!}`,
      ...toHeaderValue(body ? JSON.stringify(body) : undefined),
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${text}`);
  }

  if (response.status === 204) return null;
  return (await response.json()) as T;
}

function projectRowToModel(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    clientId: row.client_id ?? undefined,
    clientName: row.client_name ?? undefined,
    category: row.category,
    year: row.year,
    description: row.description,
    objective: row.objective,
    solution: row.solution,
    coverImage: row.cover_image,
    galleryImages: row.gallery_images ?? [],
    videoUrl: row.video_url ?? undefined,
    externalUrl: row.external_url ?? undefined,
    tags: row.tags ?? [],
    sortOrder: row.sort_order ?? 0,
    status: row.status,
    featured: row.featured ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function clientRowToModel(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo,
    segment: row.segment,
    description: row.description,
    website: row.website ?? undefined,
    instagram: row.instagram ?? undefined,
    status: row.status,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function settingsRowToModel(row: SettingsRow): SiteSettings {
  return {
    personalInfo: row.personal_info,
    contactInfo: row.contact_info,
    socialLinks: row.social_links,
    seoSettings: row.seo_settings,
    appearance: row.appearance,
  };
}

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
}

function sortClients(clients: Client[]) {
  return [...clients].sort((a, b) => a.sortOrder - b.sortOrder);
}

function getPublicProjects(projects: Project[]) {
  return sortProjects(projects.filter(p => p.status === 'published'));
}

function getActiveClients(clients: Client[]) {
  return sortClients(clients.filter(c => c.status === 'active'));
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    if (USE_SUPABASE) {
      const [settings, projects, clients] = await Promise.all([
        supabaseRequest<SettingsRow[]>('settings', { query: '?select=*&id=eq.1&limit=1' }),
        supabaseRequest<ProjectRow[]>('projects', { query: '?select=*' }),
        supabaseRequest<ClientRow[]>('clients', { query: '?select=*' }),
      ]);

      return res.status(200).json({
        settings: settings?.[0] ? settingsRowToModel(settings[0]) : initialSettings,
        projects: getPublicProjects((projects ?? []).map(projectRowToModel)),
        clients: getActiveClients((clients ?? []).map(clientRowToModel)),
      });
    }

    return res.status(200).json({
      settings: initialSettings,
      projects: getPublicProjects(initialProjects),
      clients: getActiveClients(initialClients),
    });
  } catch (error) {
    console.error('public/all error:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar dados públicos.' });
  }
}
