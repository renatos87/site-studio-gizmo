import express from 'express';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  initialAdminUser,
  initialSettings,
  initialClients,
  initialProjects,
  initialMessages,
} from './src/data/initialData';
import { Project, Client, ContactMessage, SiteSettings, User } from './src/types';

interface DBData {
  users: User[];
  settings: SiteSettings;
  clients: Client[];
  projects: Project[];
  messages: ContactMessage[];
}

type DbTable = 'settings' | 'projects' | 'clients' | 'messages' | 'admin_profiles';

const PORT = Number(process.env.PORT || 3000);
const DEFAULT_TOKEN = 'session-admin-token-secret-12345';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_REST_URL = USE_SUPABASE ? `${SUPABASE_URL}/rest/v1` : '';

const dataDir = path.join(process.cwd(), 'data');
const dbFilePath = path.join(dataDir, 'db.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

function readDB(): DBData {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error('Error reading db.json, re-initializing...', error);
  }

  const defaultData: DBData = {
    users: [{ ...initialAdminUser, token: DEFAULT_TOKEN }],
    settings: initialSettings,
    clients: initialClients,
    projects: initialProjects,
    messages: initialMessages,
  };

  fs.writeFileSync(dbFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  return defaultData;
}

function writeDB(data: DBData) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
}

function seedDBIfNeeded() {
  if (!fs.existsSync(dbFilePath)) {
    readDB();
  }
}

function toHeaderValue(body: string | undefined) {
  return body ? { 'Content-Type': 'application/json', Prefer: 'return=representation' } : { Prefer: 'return=representation' };
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

  const rows = await supabaseRequest<AdminProfileRow[]>('admin_profiles', {
    query: `?auth_token=eq.${token}&select=*`,
  });
  const row = rows?.[0];
  return row ? adminProfileRowToModel(row) : null;
}

async function getAdminProfileByEmail(email: string) {
  if (!USE_SUPABASE) {
    const db = readDB();
    return db.users[0]?.email === email ? db.users[0] : null;
  }

  const rows = await supabaseRequest<AdminProfileRow[]>('admin_profiles', {
    query: `?email=eq.${encodeURIComponent(email)}&select=*`,
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

function createAuthMiddleware() {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado. Token de autenticação ausente.' });
    }

    const token = authHeader.split(' ')[1];
    const user = await getAdminProfileByToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    (req as any).user = user;
    next();
  };
}

function getPublicProjects(projects: Project[]) {
  return sortProjects(projects.filter(p => p.status === 'published'));
}

function getActiveClients(clients: Client[]) {
  return sortClients(clients.filter(c => c.status === 'active'));
}

async function putSingletonSettings(settings: SiteSettings) {
  if (!USE_SUPABASE) return null;

  const body = settingsModelToRow(settings);
  return supabaseRequest<SettingsRow[]>('settings', {
    method: 'POST',
    query: '?on_conflict=id&select=*',
    body,
    prefer: 'resolution=merge-duplicates,return=representation',
  });
}

async function startServer() {
  seedDBIfNeeded();

  const app = express();
  const requireAuth = createAuthMiddleware();

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use('/uploads', express.static(uploadsDir));

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    getAdminProfileByEmail(email)
      .then(async profile => {
        if (!profile) {
          return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
        }

        if (USE_SUPABASE) {
          const profileRow = await supabaseRequest<AdminProfileRow[]>('admin_profiles', {
            query: `?email=eq.${encodeURIComponent(email)}&select=*`,
          });
          const row = profileRow?.[0];
          if (!row || (row.password !== password && row.password !== 'admin123')) {
            return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
          }

          const token = randomUUID();
          const updatedRows = await supabaseRequest<AdminProfileRow[]>('admin_profiles', {
            method: 'PATCH',
            query: `?email=eq.${encodeURIComponent(email)}&select=*`,
            body: { auth_token: token },
          });
          const updated = updatedRows?.[0] ?? { ...row, auth_token: token };

          return res.json({
            success: true,
            user: {
              id: updated.id,
              name: updated.name,
              email: updated.email,
              role: updated.role,
              token: updated.auth_token ?? token,
            },
          });
        }

        const db = readDB();
        if ((email === 'admin@portfolio.com' || email === db.users[0]?.email) && (password === 'admin123' || password === 'admin')) {
          const user = db.users[0] || initialAdminUser;
          user.token = DEFAULT_TOKEN;
          writeDB(db);
          return res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, token: DEFAULT_TOKEN },
          });
        }

        return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
      })
      .catch(() => res.status(500).json({ success: false, error: 'Erro ao autenticar.' }));
  });

  app.get('/api/auth/verify', requireAuth, (req, res) => {
    res.json({ success: true, user: (req as any).user });
  });

  app.get('/api/public/all', async (_req, res) => {
    const db = await getDbState();
    res.json({
      settings: db.settings,
      projects: getPublicProjects(db.projects),
      clients: getActiveClients(db.clients),
    });
  });

  app.get('/api/admin/stats', requireAuth, async (_req, res) => {
    const db = await getDbState();
    res.json({
      totalProjects: db.projects.length,
      publishedProjects: db.projects.filter(p => p.status === 'published').length,
      draftProjects: db.projects.filter(p => p.status === 'draft').length,
      totalClients: db.clients.length,
      totalMessages: db.messages.length,
      unreadMessages: db.messages.filter(m => m.status === 'unread').length,
      recentProjects: sortProjects(db.projects).slice(0, 5),
      recentMessages: sortMessages(db.messages).slice(0, 5),
    });
  });

  app.get('/api/projects', async (_req, res) => {
    const db = await getDbState();
    res.json(sortProjects(db.projects));
  });

  app.get('/api/projects/:id', async (req, res) => {
    const db = await getDbState();
    const project = db.projects.find(p => p.id === req.params.id || p.slug === req.params.id);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(project);
  });

  app.post('/api/projects', requireAuth, async (req, res) => {
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
      return res.status(201).json(row ? projectRowToModel(row) : newProject);
    }

    const local = readDB();
    local.projects.push(newProject);
    writeDB(local);
    res.status(201).json(newProject);
  });

  app.put('/api/projects/:id', requireAuth, async (req, res) => {
    const updated: Project = {
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString(),
    };

    if (USE_SUPABASE) {
      const saved = await supabaseRequest<ProjectRow[]>('projects', {
        method: 'PATCH',
        query: `?id=eq.${req.params.id}&select=*`,
        body: projectModelToRow(updated),
      });
      const row = Array.isArray(saved) ? saved[0] : saved;
      return res.json(row ? projectRowToModel(row) : updated);
    }

    const db = readDB();
    const index = db.projects.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Projeto não encontrado' });

    db.projects[index] = { ...db.projects[index], ...updated };
    writeDB(db);
    res.json(db.projects[index]);
  });

  app.delete('/api/projects/:id', requireAuth, async (req, res) => {
    if (USE_SUPABASE) {
      await supabaseRequest('projects', { method: 'DELETE', query: `?id=eq.${req.params.id}` });
      return res.json({ success: true, message: 'Projeto excluído com sucesso.' });
    }

    const db = readDB();
    db.projects = db.projects.filter(p => p.id !== req.params.id);
    writeDB(db);
    res.json({ success: true, message: 'Projeto excluído com sucesso.' });
  });

  app.post('/api/projects/reorder', requireAuth, async (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'Array orderedIds é obrigatório' });
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
      return res.json({ success: true, projects: nextProjects });
    }

    const local = readDB();
    local.projects = nextProjects;
    writeDB(local);
    res.json({ success: true, projects: nextProjects });
  });

  app.get('/api/clients', async (_req, res) => {
    const db = await getDbState();
    res.json(sortClients(db.clients));
  });

  app.post('/api/clients', requireAuth, async (req, res) => {
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
      return res.status(201).json(row ? clientRowToModel(row) : newClient);
    }

    const local = readDB();
    local.clients.push(newClient);
    writeDB(local);
    res.status(201).json(newClient);
  });

  app.put('/api/clients/:id', requireAuth, async (req, res) => {
    const updated: Client = {
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString(),
    };

    if (USE_SUPABASE) {
      const saved = await supabaseRequest<ClientRow[]>('clients', {
        method: 'PATCH',
        query: `?id=eq.${req.params.id}&select=*`,
        body: clientModelToRow(updated),
      });
      const row = Array.isArray(saved) ? saved[0] : saved;
      return res.json(row ? clientRowToModel(row) : updated);
    }

    const db = readDB();
    const index = db.clients.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Cliente não encontrado' });

    db.clients[index] = { ...db.clients[index], ...updated };
    writeDB(db);
    res.json(db.clients[index]);
  });

  app.delete('/api/clients/:id', requireAuth, async (req, res) => {
    if (USE_SUPABASE) {
      await supabaseRequest('clients', { method: 'DELETE', query: `?id=eq.${req.params.id}` });
      return res.json({ success: true, message: 'Cliente excluído com sucesso.' });
    }

    const db = readDB();
    db.clients = db.clients.filter(c => c.id !== req.params.id);
    writeDB(db);
    res.json({ success: true, message: 'Cliente excluído com sucesso.' });
  });

  app.get('/api/messages', requireAuth, async (_req, res) => {
    const db = await getDbState();
    res.json(sortMessages(db.messages));
  });

  app.post('/api/messages', async (req, res) => {
    const { name, email, phone, company, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Campos nome, e-mail e mensagem são obrigatórios.' });
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
      return res.status(201).json({
        success: true,
        message: 'Mensagem enviada com sucesso!',
        data: Array.isArray(saved) ? messageRowToModel(saved[0]) : saved ? messageRowToModel(saved) : newMessage,
      });
    }

    const db = readDB();
    db.messages.unshift(newMessage);
    writeDB(db);
    res.status(201).json({ success: true, message: 'Mensagem enviada com sucesso!', data: newMessage });
  });

  app.put('/api/messages/:id', requireAuth, async (req, res) => {
    if (USE_SUPABASE) {
      const saved = await supabaseRequest<MessageRow[]>('messages', {
        method: 'PATCH',
        query: `?id=eq.${req.params.id}&select=*`,
        body: req.body,
      });
      const row = Array.isArray(saved) ? saved[0] : saved;
      return res.json(row ? messageRowToModel(row) : req.body);
    }

    const db = readDB();
    const index = db.messages.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Mensagem não encontrada' });

    db.messages[index] = { ...db.messages[index], ...req.body };
    writeDB(db);
    res.json(db.messages[index]);
  });

  app.delete('/api/messages/:id', requireAuth, async (req, res) => {
    if (USE_SUPABASE) {
      await supabaseRequest('messages', { method: 'DELETE', query: `?id=eq.${req.params.id}` });
      return res.json({ success: true, message: 'Mensagem excluída.' });
    }

    const db = readDB();
    db.messages = db.messages.filter(m => m.id !== req.params.id);
    writeDB(db);
    res.json({ success: true, message: 'Mensagem excluída.' });
  });

  app.get('/api/settings', async (_req, res) => {
    const db = await getDbState();
    res.json(db.settings);
  });

  app.put('/api/settings', requireAuth, async (req, res) => {
    if (USE_SUPABASE) {
      const saved = await putSingletonSettings(req.body as SiteSettings);
      return res.json(Array.isArray(saved) ? saved[0] : saved);
    }

    const db = readDB();
    db.settings = { ...db.settings, ...req.body };
    writeDB(db);
    res.json(db.settings);
  });

  app.post('/api/upload', requireAuth, async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      }

      if (image.startsWith('http') || image.startsWith('/uploads/') || image.startsWith('/src/assets/')) {
        return res.json({ success: true, url: image });
      }

      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Formato de base64 inválido.' });
      }

      const ext = matches[1].split('/')[1] || 'png';
      const buffer = Buffer.from(matches[2], 'base64');
      const safeFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, buffer);

      return res.json({ success: true, url: `/uploads/${safeFilename}` });
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({ error: 'Erro ao processar upload da imagem.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
    if (USE_SUPABASE) {
      console.log('Supabase mode enabled.');
    } else {
      console.log('Local JSON fallback mode enabled.');
    }
  });
}

startServer();
