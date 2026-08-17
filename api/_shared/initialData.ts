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

export const initialClients: Client[] = [
  {
    id: 'cli-1',
    name: 'Aetheria AI Labs',
    slug: 'aetheria-ai-labs',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    segment: 'Tecnologia & InteligÃªncia Artificial',
    description: 'LaboratÃ³rio de pesquisas de IA gerativa e inteligÃªncia de dados aplicada.',
    website: 'https://aetheria.ai',
    instagram: '@aetheria.labs',
    status: 'active',
    sortOrder: 1,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-2',
    name: 'NEXUS Electric Mobility',
    slug: 'nexus-electric',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300&auto=format&fit=crop&q=80',
    segment: 'Automotivo & Mobilidade SustentÃ¡vel',
    description: 'Fabricante pioneira de veÃ­culos elÃ©tricos e soluÃ§Ãµes inteligentes de energia urbana.',
    website: 'https://nexusev.com',
    instagram: '@nexusev',
    status: 'active',
    sortOrder: 2,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-3',
    name: 'Maison Noir Architecture',
    slug: 'maison-noir',
    logo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80',
    segment: 'Arquitetura & Design de Luxo',
    description: 'EstÃºdio boutique internacional focado em projetos residenciais de altÃ­ssimo padrÃ£o.',
    website: 'https://maisonnoir.arch',
    instagram: '@maisonnoir.arch',
    status: 'active',
    sortOrder: 3,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cli-4',
    name: 'Vanguard Media Group',
    slug: 'vanguard-media',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=300&auto=format&fit=crop&q=80',
    segment: 'Publicidade & Entretenimento',
    description: 'Conglomerado de mÃ­dia e produÃ§Ãµes audiovisuais contemporÃ¢neas.',
    website: 'https://vanguardmedia.com',
    instagram: '@vanguardmedia',
    status: 'active',
    sortOrder: 4,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
export const initialProjects: Project[] = [];
export const initialMessages: ContactMessage[] = [];
