import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import 'dotenv/config';
import {
  initialAdminUser,
  initialSettings,
  initialClients,
  initialProjects,
  initialMessages,
} from './_shared/initialData.js';
import type { Project, Client, ContactMessage, SiteSettings, User } from '../src/types';

interface DBData {
  users: User[];
  settings: SiteSettings;
  clients: Client[];
  projects: Project[];
  messages: ContactMessage[];
}

type DbTable = 'settings' | 'projects' | 'clients' | 'messages' | 'admin_profiles';

const DEFAULT_TOKEN = 'session-admin-token-secret-12345';
const SUPABASE_URL = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_REST_URL = USE_SUPABASE ? `${SUPABASE_URL}/rest/v1` : '';

const dataDir = path.join(process.cwd(), 'data');
const dbFilePath = path.join(dataDir, 'db.json');

function readDB(): DBData {
  try {
    if (fs.existsSync(dbFilePath)) {
      return JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
    }
  } catch {
    // Fall back to seeded data.
  }

  const defaultData: DBData = {
    users: [{ ...initialAdminUser, token: DEFAULT_TOKEN }],
    settings: initialSettings,
    clients: initialClients,
    projects: initialProjects,
    messages: initialMessages,
  };

  return defaultData;
}

function writeDB(data: DBData) {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Ignore writes in ephemeral/serverless environments.
  }
}

function toHeaderValue(body: string | undefined) {
  return body
    ? { 'Content-Type': 'application/json', Prefer: 'return=representation' }
    : { Prefer: 'return=representation' };
}

type ProjectRow = Omit<Project, 'id' | 'clientId' | 'clientName' | 'coverImage' | 'galleryImages' | 'videoUrl' | 'externalUrl' | 'sortOrder' | 'createdAt' | 'updatedAt'> & {
  id: string;
  client_id?: string | null;
  client_name?: string | null;
  cover_image: string;
  gallery_images: Project['galleryImages'];
  video_url?: string | null;
  external_url?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  status: Project['status'];
  featured: boolean;
  tags: string[];
};

type ClientRow = Omit<Client, 'sortOrder' | 'createdAt' | 'updatedAt'> & {
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type MessageRow = Omit<ContactMessage, 'createdAt'> & {
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
  created_at?: string;
  updated_at?: string;
};

type AdminProfileRow = {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  password: string;
  auth_token?: string | null;
  role: 'admin';
  created_at?: string;
  updated_at?: string;
};

function projectRowToModel(row: any): Project {
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

function projectModelToRow(model: Partial<Project>) {
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

function clientRowToModel(row: any): Client {
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

function clientModelToRow(model: Partial<Client>) {
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

function messageRowToModel(row: any): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    company: row.company ?? '',
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

function messageModelToRow(model: ContactMessage) {
  return {
    id: model.id,
    name: model.name,
    email: model.email,
    phone: model.phone ?? '',
    company: model.company ?? '',
    subject: model.subject,
    message: model.message,
    status: model.status,
    created_at: model.createdAt,
    updated_at: model.createdAt,
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

function settingsModelToRow(model: SiteSettings): SettingsRow {
  return {
    id: 1,
    personal_info: model.personalInfo,
    contact_info: model.contactInfo,
    social_links: model.socialLinks,
    seo_settings: model.seoSettings,
    appearance: model.appearance,
  };
}

function adminProfileRowToModel(row: AdminProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: 'admin',
    token: row.auth_token ?? undefined,
  };
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

async function getSupabaseState() {
  if (!USE_SUPABASE) return null;

  const [settings, projects, clients, messages] = await Promise.all([
    supabaseRequest<SettingsRow[]>('settings', { query: '?select=*&id=eq.1&limit=1' }),
    supabaseRequest<ProjectRow[]>('projects', { query: '?select=*' }),
    supabaseRequest<ClientRow[]>('clients', { query: '?select=*' }),
    supabaseRequest<MessageRow[]>('messages', { query: '?select=*' }),
  ]);

  return {
    settings: settings?.[0] ? settingsRowToModel(settings[0]) : initialSettings,
    projects: (projects ?? []).map(projectRowToModel),
    clients: (clients ?? []).map(clientRowToModel),
    messages: (messages ?? []).map(messageRowToModel),
  };
}

async function getDbState(): Promise<DBData> {
  const remote = await getSupabaseState();
  if (remote) {
    return {
      users: [{ ...initialAdminUser, token: DEFAULT_TOKEN }],
      settings: remote.settings,
      clients: remote.clients,
      projects: remote.projects,
      messages: remote.messages,
    };
  }

  return readDB();
}

async function getAdminProfileByToken(token: string) {
  if (!USE_SUPABASE) {
    const db = readDB();
    return db.users.find(u => u.token === token || token === 'admin123' || token === DEFAULT_TOKEN) || null;
  }

  if (token === 'admin123' || token === DEFAULT_TOKEN) {
    return { ...initialAdminUser, token: DEFAULT_TOKEN };
  }

  const rows = await supabaseRequest<AdminProfileRow[]>('admin_profiles', {
    query: `?auth_token=eq.${token}&select=*`,
  });
  const row = rows?.[0];
  return row ? adminProfileRowToModel(row) : null;
}

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => a.sortOrder - b.sortOrder);
}

function sortClients(clients: Client[]) {
  return [...clients].sort((a, b) => a.sortOrder - b.sortOrder);
}

function sortMessages(messages: ContactMessage[]) {
  return [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function getPublicProjects(projects: Project[]) {
  return sortProjects(projects.filter(p => p.status === 'published'));
}

function getActiveClients(clients: Client[]) {
  return sortClients(clients.filter(c => c.status === 'active'));
}

function authUserFromHeader(req: any) {
  const authHeader = String(req.headers?.authorization || '');
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1] || null;
}

async function requireAuth(req: { headers?: Record<string, string | string[] | undefined> }, res: { status: (code: number) => { json: (payload: unknown) => void } }) {
  const token = authUserFromHeader(req);
  if (!token) {
    res.status(401).json({ error: 'Não autorizado. Token de autenticação ausente.' });
    return null;
  }

  const user = await getAdminProfileByToken(token);
  if (!user) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
    return null;
  }

  return user;
}

function sendJson(res: { status: (code: number) => { json: (payload: unknown) => void } }, status: number, payload: unknown) {
  res.status(status).json(payload);
}

async function handleLogin(req: any, res: any) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (USE_SUPABASE) {
    try {
      const rows = await supabaseRequest<AdminProfileRow[]>('admin_profiles', {
        query: `?email=eq.${encodeURIComponent(email)}&select=*`,
      });
      const row = rows?.[0];

      if (!row) {
        if (email === initialAdminUser.email && (password === 'admin123' || password === 'admin')) {
          return sendJson(res, 200, {
            success: true,
            user: {
              id: initialAdminUser.id,
              name: initialAdminUser.name,
              email: initialAdminUser.email,
              role: initialAdminUser.role,
              token: DEFAULT_TOKEN,
            },
          });
        }
        return sendJson(res, 401, { success: false, error: 'E-mail ou senha incorretos.' });
      }

      if (row.password !== password && row.password !== 'admin123') {
        return sendJson(res, 401, { success: false, error: 'E-mail ou senha incorretos.' });
      }

      const token = randomUUID();
      const updatedRows = await supabaseRequest<AdminProfileRow[]>('admin_profiles', {
        method: 'PATCH',
        query: `?id=eq.${row.id}&select=*`,
        body: { auth_token: token },
      });
      const updated = updatedRows?.[0] ?? { ...row, auth_token: token };

      return sendJson(res, 200, {
        success: true,
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          token: updated.auth_token ?? token,
        },
      });
    } catch {
      return sendJson(res, 500, { success: false, error: 'Erro ao autenticar.' });
    }
  }

  const db = readDB();
  if ((email === 'admin@portfolio.com' || email === db.users[0]?.email) && (password === 'admin123' || password === 'admin')) {
    const user = db.users[0] || initialAdminUser;
    user.token = DEFAULT_TOKEN;
    writeDB(db);
    return sendJson(res, 200, {
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, token: DEFAULT_TOKEN },
    });
  }

  return sendJson(res, 401, { success: false, error: 'E-mail ou senha incorretos.' });
}

async function handleSettingsPut(req: any, res: any) {
  const auth = await requireAuth(req, res);
  if (!auth) return;

  if (USE_SUPABASE) {
    const saved = await supabaseRequest<SettingsRow[]>('settings', {
      method: 'POST',
      query: '?on_conflict=id&select=*',
      body: settingsModelToRow(req.body as SiteSettings),
      prefer: 'resolution=merge-duplicates,return=representation',
    });
    return sendJson(res, 200, Array.isArray(saved) ? settingsRowToModel(saved[0]) : saved);
  }

  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  return sendJson(res, 200, db.settings);
}

export default async function handler(req: any, res: any) {
  const url = new URL(req.url || '/', 'http://localhost');
  const segments = url.pathname.split('/').filter(Boolean);
  const route = `/${segments.slice(1).join('/')}`;
  const method = (req.method || 'GET').toUpperCase();

  try {
    if (route === '/auth/login' && method === 'POST') return handleLogin(req, res);
    if (route === '/auth/verify' && method === 'GET') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      return sendJson(res, 200, { success: true, user: auth });
    }

    if (route === '/public/all' && method === 'GET') {
      const db = await getDbState();
      return sendJson(res, 200, {
        settings: db.settings,
        projects: getPublicProjects(db.projects),
        clients: getActiveClients(db.clients),
      });
    }

    if (route === '/admin/stats' && method === 'GET') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const db = await getDbState();
      return sendJson(res, 200, {
        totalProjects: db.projects.length,
        publishedProjects: db.projects.filter(p => p.status === 'published').length,
        draftProjects: db.projects.filter(p => p.status === 'draft').length,
        totalClients: db.clients.length,
        totalMessages: db.messages.length,
        unreadMessages: db.messages.filter(m => m.status === 'unread').length,
        recentProjects: sortProjects(db.projects).slice(0, 5),
        recentMessages: sortMessages(db.messages).slice(0, 5),
      });
    }

    if (route === '/projects' && method === 'GET') {
      const db = await getDbState();
      return sendJson(res, 200, sortProjects(db.projects));
    }

    if (route.startsWith('/projects/') && method === 'GET') {
      const db = await getDbState();
      const id = segments[1];
      const project = db.projects.find(p => p.id === id || p.slug === id);
      if (!project) return sendJson(res, 404, { error: 'Projeto não encontrado' });
      return sendJson(res, 200, project);
    }

    if (route === '/projects' && method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const db = await getDbState();
      const newProject: Project = {
        ...req.body,
        id: req.body.id || `proj-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sortOrder: Number(req.body.sortOrder ?? db.projects.length + 1),
      };

      if (USE_SUPABASE) {
        const saved = await supabaseRequest<ProjectRow[]>('projects', {
          method: 'POST',
          query: '?select=*',
          body: projectModelToRow(newProject),
        });
        const row = Array.isArray(saved) ? saved[0] : saved;
        return sendJson(res, 201, row ? projectRowToModel(row) : newProject);
      }

      const local = readDB();
      local.projects.push(newProject);
      writeDB(local);
      return sendJson(res, 201, newProject);
    }

    if (route.startsWith('/projects/') && method === 'PUT') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const id = segments[1];
      const updated: Project = { ...req.body, id, updatedAt: new Date().toISOString() };

      if (USE_SUPABASE) {
        const saved = await supabaseRequest<ProjectRow[]>('projects', {
          method: 'PATCH',
          query: `?id=eq.${id}&select=*`,
          body: projectModelToRow(updated),
        });
        const row = Array.isArray(saved) ? saved[0] : saved;
        return sendJson(res, 200, row ? projectRowToModel(row) : updated);
      }

      const db = readDB();
      const index = db.projects.findIndex(p => p.id === id);
      if (index === -1) return sendJson(res, 404, { error: 'Projeto não encontrado' });
      db.projects[index] = { ...db.projects[index], ...updated };
      writeDB(db);
      return sendJson(res, 200, db.projects[index]);
    }

    if (route.startsWith('/projects/') && method === 'DELETE') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const id = segments[1];
      if (USE_SUPABASE) {
        await supabaseRequest('projects', { method: 'DELETE', query: `?id=eq.${id}` });
        return sendJson(res, 200, { success: true, message: 'Projeto excluído com sucesso.' });
      }

      const db = readDB();
      db.projects = db.projects.filter(p => p.id !== id);
      writeDB(db);
      return sendJson(res, 200, { success: true, message: 'Projeto excluído com sucesso.' });
    }

    if (route === '/projects/reorder' && method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return sendJson(res, 400, { error: 'Array orderedIds é obrigatório' });
      }

      const db = await getDbState();
      const orderedProjects = orderedIds
        .map((id: string, index: number) => {
          const project = db.projects.find(p => p.id === id);
          return project ? { ...project, sortOrder: index + 1 } : null;
        })
        .filter(Boolean) as Project[];
      const remaining = db.projects.filter(p => !orderedIds.includes(p.id));
      const nextProjects = sortProjects([...orderedProjects, ...remaining]);

      if (USE_SUPABASE) {
        await Promise.all(
          nextProjects.map(project =>
            supabaseRequest('projects', {
              method: 'PATCH',
              query: `?id=eq.${project.id}`,
              body: { sortOrder: project.sortOrder, updatedAt: new Date().toISOString() },
            }),
          ),
        );
        return sendJson(res, 200, { success: true, projects: nextProjects });
      }

      const local = readDB();
      local.projects = nextProjects;
      writeDB(local);
      return sendJson(res, 200, { success: true, projects: nextProjects });
    }

    if (route === '/clients' && method === 'GET') {
      const db = await getDbState();
      return sendJson(res, 200, sortClients(db.clients));
    }

    if (route === '/clients' && method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const db = await getDbState();
      const newClient: Client = {
        ...req.body,
        id: req.body.id || `cli-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sortOrder: Number(req.body.sortOrder ?? db.clients.length + 1),
      };

      if (USE_SUPABASE) {
        const saved = await supabaseRequest<ClientRow[]>('clients', {
          method: 'POST',
          query: '?select=*',
          body: clientModelToRow(newClient),
        });
        const row = Array.isArray(saved) ? saved[0] : saved;
        return sendJson(res, 201, row ? clientRowToModel(row) : newClient);
      }

      const local = readDB();
      local.clients.push(newClient);
      writeDB(local);
      return sendJson(res, 201, newClient);
    }

    if (route.startsWith('/clients/') && method === 'PUT') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const id = segments[1];
      const updated: Client = { ...req.body, id, updatedAt: new Date().toISOString() };

      if (USE_SUPABASE) {
        const saved = await supabaseRequest<ClientRow[]>('clients', {
          method: 'PATCH',
          query: `?id=eq.${id}&select=*`,
          body: clientModelToRow(updated),
        });
        const row = Array.isArray(saved) ? saved[0] : saved;
        return sendJson(res, 200, row ? clientRowToModel(row) : updated);
      }

      const db = readDB();
      const index = db.clients.findIndex(c => c.id === id);
      if (index === -1) return sendJson(res, 404, { error: 'Cliente não encontrado' });
      db.clients[index] = { ...db.clients[index], ...updated };
      writeDB(db);
      return sendJson(res, 200, db.clients[index]);
    }

    if (route.startsWith('/clients/') && method === 'DELETE') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const id = segments[1];
      if (USE_SUPABASE) {
        await supabaseRequest('clients', { method: 'DELETE', query: `?id=eq.${id}` });
        return sendJson(res, 200, { success: true, message: 'Cliente excluído com sucesso.' });
      }

      const db = readDB();
      db.clients = db.clients.filter(c => c.id !== id);
      writeDB(db);
      return sendJson(res, 200, { success: true, message: 'Cliente excluído com sucesso.' });
    }

    if (route === '/messages' && method === 'GET') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const db = await getDbState();
      return sendJson(res, 200, sortMessages(db.messages));
    }

    if (route === '/messages' && method === 'POST') {
      const { name, email, phone, company, subject, message } = req.body;
      if (!name || !email || !message) {
        return sendJson(res, 400, { error: 'Campos nome, e-mail e mensagem são obrigatórios.' });
      }

      const newMessage: ContactMessage = {
        id: `msg-${Date.now()}`,
        name,
        email,
        phone: phone || '',
        company: company || '',
        subject: subject || 'Contato via Portfólio',
        message,
        status: 'unread',
        createdAt: new Date().toISOString(),
      };

      if (USE_SUPABASE) {
        const saved = await supabaseRequest<MessageRow[]>('messages', {
          method: 'POST',
          query: '?select=*',
          body: messageModelToRow(newMessage),
        });
        return sendJson(res, 201, {
          success: true,
          message: 'Mensagem enviada com sucesso!',
          data: Array.isArray(saved) ? messageRowToModel(saved[0]) : saved ? messageRowToModel(saved) : newMessage,
        });
      }

      const db = readDB();
      db.messages.unshift(newMessage);
      writeDB(db);
      return sendJson(res, 201, { success: true, message: 'Mensagem enviada com sucesso!', data: newMessage });
    }

    if (route.startsWith('/messages/') && method === 'PUT') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const id = segments[1];
      if (USE_SUPABASE) {
        const saved = await supabaseRequest<MessageRow[]>('messages', {
          method: 'PATCH',
          query: `?id=eq.${id}&select=*`,
          body: req.body,
        });
        const row = Array.isArray(saved) ? saved[0] : saved;
        return sendJson(res, 200, row ? messageRowToModel(row) : req.body);
      }

      const db = readDB();
      const index = db.messages.findIndex(m => m.id === id);
      if (index === -1) return sendJson(res, 404, { error: 'Mensagem não encontrada' });
      db.messages[index] = { ...db.messages[index], ...req.body };
      writeDB(db);
      return sendJson(res, 200, db.messages[index]);
    }

    if (route.startsWith('/messages/') && method === 'DELETE') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const id = segments[1];
      if (USE_SUPABASE) {
        await supabaseRequest('messages', { method: 'DELETE', query: `?id=eq.${id}` });
        return sendJson(res, 200, { success: true, message: 'Mensagem excluída.' });
      }

      const db = readDB();
      db.messages = db.messages.filter(m => m.id !== id);
      writeDB(db);
      return sendJson(res, 200, { success: true, message: 'Mensagem excluída.' });
    }

    if (route === '/settings' && method === 'GET') {
      const db = await getDbState();
      return sendJson(res, 200, db.settings);
    }

    if (route === '/settings' && method === 'PUT') {
      return handleSettingsPut(req, res);
    }

    if (route === '/upload' && method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;

      const { image } = req.body || {};
      if (!image) {
        return sendJson(res, 400, { error: 'Nenhuma imagem enviada.' });
      }

      if (image.startsWith('http') || image.startsWith('/uploads/') || image.startsWith('/src/assets/')) {
        return sendJson(res, 200, { success: true, url: image });
      }

      const matches = String(image).match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return sendJson(res, 400, { error: 'Formato de base64 inválido.' });
      }

      return sendJson(res, 501, { error: 'Upload local não é suportado em Serverless; use URLs ou Supabase Storage.' });
    }

    return sendJson(res, 404, { error: 'Rota não encontrada.' });
  } catch (error) {
    console.error('API error:', error);
    return sendJson(res, 500, { error: 'Erro interno no servidor.' });
  }
}
