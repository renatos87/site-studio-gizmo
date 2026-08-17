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
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
  submitContactForm: (data: { name: string; email: string; phone?: string; company?: string; subject?: string; message: string }) => Promise<{ success: boolean; message: string }>;
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
  apiAvailable: boolean;
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
  const [apiAvailable, setApiAvailable] = useState<boolean>(true);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') || '';

  const apiFetch = (path: string, init?: RequestInit) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return fetch(`${apiBaseUrl}${normalizedPath}`, init);
  };

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

  const getAuthHeaders = () => {
    const token = adminUser?.token || localStorage.getItem('admin_token');
    return token
      ? {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      : {
          'Content-Type': 'application/json',
        };
  };

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

  const refreshAllData = async () => {
    try {
      setIsLoading(true);
      setApiAvailable(true);
      const res = await apiFetch('/api/public/all');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.projects) setProjects(data.projects);
        if (data.clients) setClients(data.clients);
      } else {
        setApiAvailable(false);
      }

      const token = localStorage.getItem('admin_token');
      if (token) {
        const [projRes, msgRes] = await Promise.all([
          apiFetch('/api/projects', { headers: getAuthHeaders() }),
          apiFetch('/api/messages', { headers: getAuthHeaders() }),
        ]);
        if (projRes.ok) {
          setProjects(await projRes.json());
        } else {
          setApiAvailable(false);
        }
        const clientsRes = await apiFetch('/api/clients', { headers: getAuthHeaders() });
        if (clientsRes.ok) {
          setClients(await clientsRes.json());
        } else {
          setApiAvailable(false);
        }
        if (msgRes.ok) {
          setMessages(await msgRes.json());
        } else {
          setApiAvailable(false);
        }
      }
    } catch (err) {
      setApiAvailable(false);
      console.warn('API error while loading portfolio data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [adminUser]);

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setAdminUser(data.user);
        localStorage.setItem('admin_token', data.user.token);
        showNotification('Login efetuado com sucesso!');
        await refreshAllData();
        return true;
      }

      showNotification(data.error || 'Credenciais inválidas.', 'error');
      return false;
    } catch {
      showNotification('Erro ao conectar ao servidor de autenticação.', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('admin_token');
    showNotification('Sessão encerrada.');
    if (activeSection === 'admin') {
      setActiveSection('home');
    }
    refreshAllData();
  };

  const submitContactForm = async (data: { name: string; email: string; phone?: string; company?: string; subject?: string; message: string }) => {
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        showNotification('Sua mensagem foi enviada com sucesso! Entrarei em contato em breve.');
        await refreshAllData();
        return { success: true, message: 'Mensagem enviada com sucesso!' };
      }

      showNotification(result.error || 'Erro ao enviar mensagem.', 'error');
      return { success: false, message: result.error || 'Erro ao enviar mensagem.' };
    } catch {
      showNotification('Erro ao conectar ao servidor de mensagens.', 'error');
      return { success: false, message: 'Erro ao enviar mensagem.' };
    }
  };

  const saveSiteSettings = async (newSettings: SiteSettings): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) return false;
      setSettings(await res.json());
      showNotification('Configurações atualizadas com sucesso!');
      return true;
    } catch {
      showNotification('Erro ao salvar configurações.', 'error');
      return false;
    }
  };

  const saveProject = async (projectData: Partial<Project>): Promise<boolean> => {
    try {
      const isEdit = !!projectData.id;
      const url = isEdit ? `/api/projects/${projectData.id}` : '/api/projects';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(projectData),
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        showNotification(`Erro ao salvar projeto (${res.status}). ${errorText}`.trim(), 'error');
        return false;
      }

      const saved = await res.json();
      if (isEdit) {
        setProjects(prev => prev.map(p => (p.id === saved.id ? saved : p)));
      } else {
        setProjects(prev => [saved, ...prev]);
      }
      showNotification(`Projeto ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
      await refreshAllData();
      return true;
    } catch {
      showNotification('Erro ao salvar projeto.', 'error');
      return false;
    }
  };

  const deleteProjectById = async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        if (res.status === 404) {
          setProjects(prev => prev.filter(p => p.id !== id));
          setApiAvailable(false);
          showNotification('A API publicada não respondeu para exclusão. O item foi removido só da interface.', 'error');
        }
        return false;
      }
      setProjects(prev => prev.filter(p => p.id !== id));
      showNotification('Projeto removido.');
      return true;
    } catch {
      setApiAvailable(false);
      showNotification('Erro ao remover projeto.', 'error');
      return false;
    }
  };

  const reorderProjectsList = async (orderedIds: string[]): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/projects/reorder', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) return false;
      showNotification('Ordem dos projetos atualizada.');
      await refreshAllData();
      return true;
    } catch {
      showNotification('Erro ao atualizar ordem dos projetos.', 'error');
      return false;
    }
  };

  const saveClient = async (clientData: Partial<Client>): Promise<boolean> => {
    try {
      const isEdit = !!clientData.id;
      const url = isEdit ? `/api/clients/${clientData.id}` : '/api/clients';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData),
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        showNotification(`Erro ao salvar cliente (${res.status}). ${errorText}`.trim(), 'error');
        return false;
      }

      const saved = await res.json();
      if (isEdit) {
        setClients(prev => prev.map(c => (c.id === saved.id ? saved : c)));
      } else {
        setClients(prev => [...prev, saved]);
      }
      showNotification(`Cliente ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`);
      await refreshAllData();
      return true;
    } catch {
      showNotification('Erro ao salvar cliente.', 'error');
      return false;
    }
  };

  const deleteClientById = async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return false;
      setClients(prev => prev.filter(c => c.id !== id));
      showNotification('Cliente removido.');
      return true;
    } catch {
      showNotification('Erro ao remover cliente.', 'error');
      return false;
    }
  };

  const updateMessageStatusById = async (id: string, status: ContactMessage['status']): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return false;
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, status } : m)));
      showNotification(`Status da mensagem atualizado para "${status}".`);
      return true;
    } catch {
      showNotification('Erro ao atualizar status da mensagem.', 'error');
      return false;
    }
  };

  const deleteMessageById = async (id: string): Promise<boolean> => {
    try {
      const res = await apiFetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return false;
      setMessages(prev => prev.filter(m => m.id !== id));
      showNotification('Mensagem excluída.');
      return true;
    } catch {
      showNotification('Erro ao excluir mensagem.', 'error');
      return false;
    }
  };

  const uploadImageFile = async (base64OrUrl: string): Promise<string> => {
    if (!base64OrUrl.startsWith('data:')) return base64OrUrl;

    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ image: base64OrUrl }),
      });
      if (!res.ok) {
        setApiAvailable(false);
        return base64OrUrl;
      }
      const data = await res.json();
      return data.url || base64OrUrl;
    } catch {
      setApiAvailable(false);
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
        apiAvailable,
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
