export type Category = 
  | 'Branding'
  | 'Identidade Visual'
  | 'Direção de Arte'
  | 'Design Gráfico'
  | 'Social Media'
  | 'Campanhas'
  | 'Motion Design'
  | 'Marketing'
  | 'Tecnologia'
  | 'Inteligência Artificial'
  | 'Web Design';

export interface ProjectImage {
  id: string;
  url: string;
  caption?: string;
  sortOrder: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  clientId?: string;
  clientName?: string;
  category: Category;
  year: string;
  description: string;
  objective: string;
  solution: string;
  coverImage: string;
  galleryImages: ProjectImage[];
  videoUrl?: string;
  externalUrl?: string;
  tags: string[];
  sortOrder: number;
  status: 'published' | 'draft';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  slug: string;
  logo: string;
  segment: string;
  description: string;
  website?: string;
  instagram?: string;
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export interface SiteSettings {
  personalInfo: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
    heroTagline: string;
    heroDescription: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    whatsapp: string;
    location: string;
  };
  socialLinks: {
    instagram: string;
    linkedin: string;
    behance: string;
    github: string;
    youtube: string;
    twitter?: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    shareImage: string;
  };
  appearance: {
    logoText: string;
    accentColor: string;
    secondaryColor: string;
    defaultTheme: 'dark' | 'light';
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  token?: string;
}

export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  totalClients: number;
  totalMessages: number;
  unreadMessages: number;
  recentProjects: Project[];
  recentMessages: ContactMessage[];
}
