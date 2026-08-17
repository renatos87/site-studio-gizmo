import type { Project, Client, ContactMessage, SiteSettings, User } from '../../src/types';

export const initialAdminUser: User = {
  id: 'usr-1',
  name: 'Studio Gizmo',
  email: 'admin@portfolio.com',
  role: 'admin',
};

export const initialSettings: SiteSettings = {
  personalInfo: {
    name: 'Studio Gizmo',
    role: 'DireÃ§Ã£o de Arte, Design & EstratÃ©gia de IA',
    bio: 'EstÃºdio criativo liderando campanhas de alto impacto, identidades visuais marcantes e integraÃ§Ãµes avanÃ§adas de tecnologia e InteligÃªncia Artificial para marcas globais.',
    avatar: '/src/assets/images/avatar_portrait_1786470592220.jpg',
    heroTagline: 'Publicidade, Design, Marketing e Tecnologia para transformar ideias em experiÃªncias.',
    heroDescription: 'Especialistas na fusÃ£o de direÃ§Ã£o de arte conceitual, design moderno e inteligÃªncia artificial aplicada Ã  comunicaÃ§Ã£o de marcas extraordinÃ¡rias.',
  },
  contactInfo: {
    email: 'contato@studiogizmo.com',
    phone: '+55 11 98765-4321',
    whatsapp: '5511987654321',
    location: 'SÃ£o Paulo, Brasil â€¢ Atendimento Global',
  },
  socialLinks: {
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    behance: 'https://behance.net',
    github: 'https://github.com',
    youtube: 'https://youtube.com',
    twitter: 'https://x.com',
  },
  seoSettings: {
    metaTitle: 'Studio Gizmo â€” DireÃ§Ã£o de Arte, Design & Tecnologia',
    metaDescription: 'PortfÃ³lio do Studio Gizmo: direÃ§Ã£o de arte, branding, campanhas de publicidade e soluÃ§Ãµes inovadoras em InteligÃªncia Artificial.',
    keywords: 'studio gizmo, diretor de arte, design grafico, branding, publicidade, tecnologia, inteligencia artificial, marketing, sao paulo',
    shareImage: '/src/assets/images/project_ai_branding_1786470608646.jpg',
  },
  appearance: {
    logoText: 'STUDIO GIZMO',
    accentColor: '#c5a47e',
    secondaryColor: '#10b981',
    defaultTheme: 'dark',
  },
};

export const initialClients: Client[] = [];
export const initialProjects: Project[] = [];
export const initialMessages: ContactMessage[] = [];
