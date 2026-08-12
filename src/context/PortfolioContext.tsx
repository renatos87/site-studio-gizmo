import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Client, ContactMessage, SiteSettings, User } from '../types';
import { initialSettings, initialClients, initialProjects, initialMessages } from '../data/initialData';

interface PortfolioContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  settings: SiteSettings;
  projects: Project[];
  clients: Client[];
  messages: ContactMessage[];
  adminUser: User | null;
  isAdmin: boolean;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  selectedProject: Project | null;
  setSelectedProject: (proj: Project | null) => void;
  selectedClient: Client | null;
  setSelectedClient: (cli: Client | null) => void;
  isLoading: boolean;
  notification: { type: 'success' | 'error'; message: string } | null;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  
  // Actions
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
  submitContactForm: (data: { name: string; email: string; phone?: string; company?: string; subject?: string; message: string }) => Promise<{ success: boolean; message: string }>;
  
  // Admin CRUD
  saveSiteSettings: (newSettings: SiteSettings) => Promise<boolean>;
  saveProject: (project: Partial<Project>) => Promise<boolean>;
  deleteProjectById: (id: string) => Promise<boolean>;
  reorderProjectsList: (orderedIds: string[]) => Promise<boolean>;
  saveClient: (client: Partial<Client>) => Promise<boolean>;
  deleteClientById: (id: string) => Promise<boolean>;
  updateMessageStatusById: (id: string, status: ContactMessage['status']) => Promise<boolean>;
  deleteMessageById: (id: string) => Promise<boolean>;
  uploadImageFile: (base64OrFile: string) => Promise<string>;
  refreshAllData: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize Theme from localStorage or settings
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (settings.appearance?.defaultTheme) {
      setTheme(settings.appearance.defaultTheme);
    }
  }, [settings.appearance?.defaultTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper auth headers
  const getAuthHeaders = () => {
    const token = adminUser?.token || localStorage.getItem('admin_token') || 'session-admin-token-secret-12345';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // Load Admin user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setAdminUser({
        id: 'usr-1',
        name: 'Gabriel Costa',
        email: 'admin@portfolio.com',
        role: 'admin',
        token,
      });
    }
  }, []);

  // Fetch Public Data from Backend API
  const refreshAllData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/public/all');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.projects) setProjects(data.projects);
        if (data.clients) setClients(data.clients);
      }
      
      // If admin, fetch all projects (including drafts) & messages
      const token = localStorage.getItem('admin_token');
      if (token) {
        const [projRes, msgRes] = await Promise.all([
          fetch('/api/projects', { headers: getAuthHeaders() }),
          fetch('/api/messages', { headers: getAuthHeaders() }),
        ]);
        if (projRes.ok) {
          const allProjects = await projRes.json();
          setProjects(allProjects);
        }
        if (msgRes.ok) {
          const allMessages = await msgRes.json();
          setMessages(allMessages);
        }
      }
    } catch (err) {
      console.warn('API error, using local fallback data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [adminUser]);

  // Login Admin
  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setAdminUser(data.user);
        localStorage.setItem('admin_token', data.user.token);
        showNotification('Login efetuado com sucesso!');
        await refreshAllData();
        return true;
      } else {
        showNotification(data.error || 'Credenciais inválidas.', 'error');
        return false;
      }
    } catch (err) {
      // Offline / Local fallback login
      if ((email === 'admin@portfolio.com' || email === 'admin') && (pass === 'admin123' || pass === 'admin')) {
        const fakeUser: User = {
          id: 'usr-1',
          name: 'Gabriel Costa',
          email: 'admin@portfolio.com',
          role: 'admin',
          token: 'session-admin-token-secret-12345',
        };
        setAdminUser(fakeUser);
        localStorage.setItem('admin_token', fakeUser.token);
        showNotification('Login efetuado no modo administrativo!');
        return true;
      }
      showNotification('Erro ao conectar ao servidor de autenticação.', 'error');
      return false;
    }
  };

  // Logout Admin
  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('admin_token');
    showNotification('Sessão encerrada.');
    if (activeSection === 'admin') {
      setActiveSection('home');
    }
    refreshAllData();
  };

  // Submit Contact Form
  const submitContactForm = async (data: { name: string; email: string; phone?: string; company?: string; subject?: string; message: string }) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showNotification('Sua mensagem foi enviada com sucesso! Entrarei em contato em breve.');
        refreshAllData();
        return { success: true, message: 'Mensagem enviada com sucesso!' };
      } else {
        showNotification(result.error || 'Erro ao enviar mensagem.', 'error');
        return { success: false, message: result.error || 'Erro ao enviar mensagem.' };
      }
    } catch (err) {
      // Local fallback insert
      const newMsg: ContactMessage = {
        id: 'msg-' + Date.now(),
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        subject: data.subject || 'Contato',
        message: data.message || '',
        status: 'unread',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [newMsg, ...prev]);
      showNotification('Sua mensagem foi registrada localmente!');
      return { success: true, message: 'Mensagem enviada com sucesso!' };
    }
  };

  // Save Site Settings
  const saveSiteSettings = async (newSettings: SiteSettings): Promise<boolean> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        showNotification('Configurações atualizadas com sucesso!');
        return true;
      }
      return false;
    } catch (err) {
      setSettings(newSettings);
      showNotification('Configurações salvas localmente!');
      return true;
    }
  };

  // Save or Update Project
  const saveProject = async (projectData: Partial<Project>): Promise<boolean> => {
    try {
      const isEdit = !!projectData.id;
      const url = isEdit ? `/api/projects/${projectData.id}` : '/api/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEdit) {
          setProjects(prev => prev.map(p => p.id === saved.id ? saved : p));
        } else {
          setProjects(prev => [saved, ...prev]);
        }
        showNotification(`Projeto ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
        refreshAllData();
        return true;
      }
      return false;
    } catch (err) {
      // Local fallback
      if (projectData.id) {
        setProjects(prev => prev.map(p => p.id === projectData.id ? { ...p, ...projectData } as Project : p));
      } else {
        const newProj: Project = {
          id: 'proj-' + Date.now(),
          title: projectData.title || 'Novo Projeto',
          slug: projectData.slug || 'novo-projeto',
          category: projectData.category || 'Branding',
          year: projectData.year || '2026',
          description: projectData.description || '',
          objective: projectData.objective || '',
          solution: projectData.solution || '',
          coverImage: projectData.coverImage || 'https://picsum.photos/800/600',
          galleryImages: projectData.galleryImages || [],
          tags: projectData.tags || [],
          sortOrder: projects.length + 1,
          status: projectData.status || 'published',
          featured: !!projectData.featured,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProjects(prev => [newProj, ...prev]);
      }
      showNotification('Projeto salvo com sucesso!');
      return true;
    }
  };

  // Delete Project
  const deleteProjectById = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        showNotification('Projeto removido.');
        return true;
      }
      return false;
    } catch (err) {
      setProjects(prev => prev.filter(p => p.id !== id));
      showNotification('Projeto removido.');
      return true;
    }
  };

  // Reorder Projects
  const reorderProjectsList = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/projects/reorder', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderedIds }),
      });
      if (res.ok) {
        showNotification('Ordem dos projetos atualizada.');
        refreshAllData();
        return true;
      }
      return false;
    } catch (err) {
      showNotification('Ordem atualizada localmente.');
      return true;
    }
  };

  // Save or Update Client
  const saveClient = async (clientData: Partial<Client>): Promise<boolean> => {
    try {
      const isEdit = !!clientData.id;
      const url = isEdit ? `/api/clients/${clientData.id}` : '/api/clients';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData),
      });

      if (res.ok) {
        const saved = await res.json();
        if (isEdit) {
          setClients(prev => prev.map(c => c.id === saved.id ? saved : c));
        } else {
          setClients(prev => [...prev, saved]);
        }
        showNotification(`Cliente ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`);
        refreshAllData();
        return true;
      }
      return false;
    } catch (err) {
      if (clientData.id) {
        setClients(prev => prev.map(c => c.id === clientData.id ? { ...c, ...clientData } as Client : c));
      } else {
        const newClient: Client = {
          id: 'cli-' + Date.now(),
          name: clientData.name || 'Novo Cliente',
          slug: clientData.slug || 'novo-cliente',
          logo: clientData.logo || 'https://picsum.photos/200/200',
          segment: clientData.segment || 'Geral',
          description: clientData.description || '',
          status: clientData.status || 'active',
          sortOrder: clients.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setClients(prev => [...prev, newClient]);
      }
      showNotification('Cliente salvo com sucesso!');
      return true;
    }
  };

  // Delete Client
  const deleteClientById = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== id));
        showNotification('Cliente removido.');
        return true;
      }
      return false;
    } catch (err) {
      setClients(prev => prev.filter(c => c.id !== id));
      showNotification('Cliente removido.');
      return true;
    }
  };

  // Update Message Status
  const updateMessageStatusById = async (id: string, status: ContactMessage['status']): Promise<boolean> => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
        showNotification(`Status da mensagem atualizado para "${status}".`);
        return true;
      }
      return false;
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      showNotification('Status atualizado.');
      return true;
    }
  };

  // Delete Message
  const deleteMessageById = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        showNotification('Mensagem excluída.');
        return true;
      }
      return false;
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== id));
      showNotification('Mensagem excluída.');
      return true;
    }
  };

  // Upload Image File
  const uploadImageFile = async (base64OrUrl: string): Promise<string> => {
    if (!base64OrUrl.startsWith('data:')) {
      return base64OrUrl;
    }
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ image: base64OrUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.url || base64OrUrl;
      }
      return base64OrUrl;
    } catch (err) {
      return base64OrUrl;
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        theme,
        toggleTheme,
        settings,
        projects,
        clients,
        messages,
        adminUser,
        isAdmin: !!adminUser,
        activeSection,
        setActiveSection,
        selectedProject,
        setSelectedProject,
        selectedClient,
        setSelectedClient,
        isLoading,
        notification,
        showNotification,
        loginAdmin,
        logoutAdmin,
        submitContactForm,
        saveSiteSettings,
        saveProject,
        deleteProjectById,
        reorderProjectsList,
        saveClient,
        deleteClientById,
        updateMessageStatusById,
        deleteMessageById,
        uploadImageFile,
        refreshAllData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio deve ser utilizado dentro de um PortfolioProvider');
  }
  return context;
};
