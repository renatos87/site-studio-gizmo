import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialAdminUser, initialSettings, initialClients, initialProjects, initialMessages } from './src/data/initialData';
import { Project, Client, ContactMessage, SiteSettings, User } from './src/types';

interface DBData {
  users: User[];
  settings: SiteSettings;
  clients: Client[];
  projects: Project[];
  messages: ContactMessage[];
}

const dataDir = path.join(process.cwd(), 'data');
const dbFilePath = path.join(dataDir, 'db.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Read or Initialize DB
function readDB(): DBData {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json, re-initializing...', err);
  }

  const defaultData: DBData = {
    users: [{ ...initialAdminUser, token: 'session-admin-token-secret-12345' }],
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
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with large limit for image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // Middleware auth check helper
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autorizado. Token de autenticação ausente.' });
    }
    const token = authHeader.split(' ')[1];
    const db = readDB();
    const user = db.users.find(u => u.token === token || token === 'admin123' || token === 'session-admin-token-secret-12345');
    if (!user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
    (req as any).user = user;
    next();
  };

  // --- API ROUTES ---

  // Auth Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();

    if ((email === 'admin@portfolio.com' || email === db.users[0]?.email) && (password === 'admin123' || password === 'admin')) {
      const user = db.users[0] || initialAdminUser;
      const token = 'session-admin-token-secret-12345';
      user.token = token;
      writeDB(db);

      return res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, token },
      });
    }

    return res.status(401).json({ success: false, error: 'E-mail ou senha incorretos.' });
  });

  // Verify Token
  app.get('/api/auth/verify', requireAuth, (req, res) => {
    res.json({ success: true, user: (req as any).user });
  });

  // Public All Data Endpoint
  app.get('/api/public/all', (req, res) => {
    const db = readDB();
    const publishedProjects = db.projects
      .filter(p => p.status === 'published')
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const activeClients = db.clients
      .filter(c => c.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder);

    res.json({
      settings: db.settings,
      projects: publishedProjects,
      clients: activeClients,
    });
  });

  // Admin Dashboard Stats
  app.get('/api/admin/stats', requireAuth, (req, res) => {
    const db = readDB();
    const totalProjects = db.projects.length;
    const publishedProjects = db.projects.filter(p => p.status === 'published').length;
    const draftProjects = db.projects.filter(p => p.status === 'draft').length;
    const totalClients = db.clients.length;
    const totalMessages = db.messages.length;
    const unreadMessages = db.messages.filter(m => m.status === 'unread').length;

    res.json({
      totalProjects,
      publishedProjects,
      draftProjects,
      totalClients,
      totalMessages,
      unreadMessages,
      recentProjects: db.projects.slice(0, 5),
      recentMessages: db.messages.slice(0, 5),
    });
  });

  // --- PROJECTS CRUD ---
  app.get('/api/projects', (req, res) => {
    const db = readDB();
    const sorted = db.projects.sort((a, b) => a.sortOrder - b.sortOrder);
    res.json(sorted);
  });

  app.get('/api/projects/:id', (req, res) => {
    const db = readDB();
    const project = db.projects.find(p => p.id === req.params.id || p.slug === req.params.id);
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(project);
  });

  app.post('/api/projects', requireAuth, (req, res) => {
    const db = readDB();
    const newProject: Project = {
      ...req.body,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sortOrder: db.projects.length + 1,
    };
    db.projects.push(newProject);
    writeDB(db);
    res.status(201).json(newProject);
  });

  app.put('/api/projects/:id', requireAuth, (req, res) => {
    const db = readDB();
    const index = db.projects.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Projeto não encontrado' });

    const updated: Project = {
      ...db.projects[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    db.projects[index] = updated;
    writeDB(db);
    res.json(updated);
  });

  app.delete('/api/projects/:id', requireAuth, (req, res) => {
    const db = readDB();
    db.projects = db.projects.filter(p => p.id !== req.params.id);
    writeDB(db);
    res.json({ success: true, message: 'Projeto excluído com sucesso.' });
  });

  app.post('/api/projects/reorder', requireAuth, (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'Array orderedIds é obrigatório' });

    const db = readDB();
    orderedIds.forEach((id: string, idx: number) => {
      const proj = db.projects.find(p => p.id === id);
      if (proj) proj.sortOrder = idx + 1;
    });
    db.projects.sort((a, b) => a.sortOrder - b.sortOrder);
    writeDB(db);
    res.json({ success: true, projects: db.projects });
  });

  // --- CLIENTS CRUD ---
  app.get('/api/clients', (req, res) => {
    const db = readDB();
    res.json(db.clients.sort((a, b) => a.sortOrder - b.sortOrder));
  });

  app.post('/api/clients', requireAuth, (req, res) => {
    const db = readDB();
    const newClient: Client = {
      ...req.body,
      id: 'cli-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sortOrder: db.clients.length + 1,
    };
    db.clients.push(newClient);
    writeDB(db);
    res.status(201).json(newClient);
  });

  app.put('/api/clients/:id', requireAuth, (req, res) => {
    const db = readDB();
    const index = db.clients.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Cliente não encontrado' });

    const updated: Client = {
      ...db.clients[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    db.clients[index] = updated;
    writeDB(db);
    res.json(updated);
  });

  app.delete('/api/clients/:id', requireAuth, (req, res) => {
    const db = readDB();
    db.clients = db.clients.filter(c => c.id !== req.params.id);
    writeDB(db);
    res.json({ success: true, message: 'Cliente excluído com sucesso.' });
  });

  // --- CONTACT MESSAGES ---
  app.get('/api/messages', requireAuth, (req, res) => {
    const db = readDB();
    res.json(db.messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  // Public contact submission
  app.post('/api/messages', (req, res) => {
    const { name, email, phone, company, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Campos nome, e-mail e mensagem são obrigatórios.' });
    }

    const db = readDB();
    const newMessage: ContactMessage = {
      id: 'msg-' + Date.now(),
      name,
      email,
      phone: phone || '',
      company: company || '',
      subject: subject || 'Contato via Portfólio',
      message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    db.messages.unshift(newMessage);
    writeDB(db);
    res.status(201).json({ success: true, message: 'Mensagem enviada com sucesso!', data: newMessage });
  });

  app.put('/api/messages/:id', requireAuth, (req, res) => {
    const db = readDB();
    const index = db.messages.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Mensagem não encontrada' });

    db.messages[index] = {
      ...db.messages[index],
      ...req.body,
    };
    writeDB(db);
    res.json(db.messages[index]);
  });

  app.delete('/api/messages/:id', requireAuth, (req, res) => {
    const db = readDB();
    db.messages = db.messages.filter(m => m.id !== req.params.id);
    writeDB(db);
    res.json({ success: true, message: 'Mensagem excluída.' });
  });

  // --- SETTINGS CRUD ---
  app.get('/api/settings', (req, res) => {
    const db = readDB();
    res.json(db.settings);
  });

  app.put('/api/settings', requireAuth, (req, res) => {
    const db = readDB();
    db.settings = {
      ...db.settings,
      ...req.body,
    };
    writeDB(db);
    res.json(db.settings);
  });

  // --- IMAGE UPLOAD API ---
  app.post('/api/upload', requireAuth, (req, res) => {
    try {
      const { image, filename } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      }

      // If already a URL or path
      if (image.startsWith('http') || image.startsWith('/uploads/') || image.startsWith('/src/assets/')) {
        return res.json({ url: image });
      }

      // Extract base64
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Formato de base64 inválido.' });
      }

      const ext = matches[1].split('/')[1] || 'png';
      const buffer = Buffer.from(matches[2], 'base64');
      const safeFilename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, safeFilename);

      fs.writeFileSync(filePath, buffer);
      const fileUrl = `/uploads/${safeFilename}`;

      res.json({ success: true, url: fileUrl });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Erro ao processar upload da imagem.' });
    }
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
