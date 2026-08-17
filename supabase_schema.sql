-- Supabase schema for Site Studio Gizmo
-- Paste this into the Supabase SQL editor.

create extension if not exists pgcrypto;

-- Updated-at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Projects
create table if not exists public.projects (
  id text primary key,
  title text not null,
  slug text not null unique,
  client_id text,
  client_name text,
  category text not null,
  year text not null,
  description text not null,
  objective text not null,
  solution text not null,
  cover_image text not null,
  gallery_images jsonb not null default '[]'::jsonb,
  video_url text,
  external_url text,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('published', 'draft')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_status_sort_idx on public.projects (status, sort_order);
create index if not exists projects_sort_order_idx on public.projects (sort_order);
create index if not exists projects_client_id_idx on public.projects (client_id);

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- Clients
create table if not exists public.clients (
  id text primary key,
  name text not null,
  slug text not null unique,
  logo text not null,
  segment text not null,
  description text not null,
  website text,
  instagram text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_status_sort_idx on public.clients (status, sort_order);
create index if not exists clients_sort_order_idx on public.clients (sort_order);

drop trigger if exists trg_clients_updated_at on public.clients;
create trigger trg_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

-- Contact messages
create table if not exists public.messages (
  id text primary key,
  name text not null,
  email text not null,
  phone text not null default '',
  company text not null default '',
  subject text not null default 'Contato via Portfólio',
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists messages_status_created_at_idx on public.messages (status, created_at desc);
create index if not exists messages_created_at_idx on public.messages (created_at desc);

drop trigger if exists trg_messages_updated_at on public.messages;
create trigger trg_messages_updated_at
before update on public.messages
for each row execute function public.set_updated_at();

-- Site settings singleton
create table if not exists public.settings (
  id bigint primary key,
  personal_info jsonb not null,
  contact_info jsonb not null,
  social_links jsonb not null,
  seo_settings jsonb not null,
  appearance jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint settings_singleton_check check (id = 1)
);

drop trigger if exists trg_settings_updated_at on public.settings;
create trigger trg_settings_updated_at
before update on public.settings
for each row execute function public.set_updated_at();

-- Optional admin profiles table if you want to move auth later
create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  name text not null,
  email text not null unique,
  password text not null default 'admin123',
  auth_token text unique,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_admin_profiles_updated_at on public.admin_profiles;
create trigger trg_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

-- Seed settings row if empty
insert into public.settings (id, personal_info, contact_info, social_links, seo_settings, appearance)
select
  1,
  '{
    "name": "Studio Gizmo",
    "role": "Direção de Arte, Design & Estratégia de IA",
    "bio": "Estúdio criativo liderando campanhas de alto impacto, identidades visuais marcantes e integrações avançadas de tecnologia e Inteligência Artificial para marcas globais.",
    "avatar": "/src/assets/images/avatar_portrait_1786470592220.jpg",
    "heroTagline": "Publicidade, Design, Marketing e Tecnologia para transformar ideias em experiências.",
    "heroDescription": "Especialistas na fusão de direção de arte conceitual, design moderno e inteligência artificial aplicada à comunicação de marcas extraordinárias."
  }'::jsonb,
  '{
    "email": "contato@studiogizmo.com",
    "phone": "+55 11 98765-4321",
    "whatsapp": "5511987654321",
    "location": "São Paulo, Brasil • Atendimento Global"
  }'::jsonb,
  '{
    "instagram": "https://instagram.com",
    "linkedin": "https://linkedin.com",
    "behance": "https://behance.net",
    "github": "https://github.com",
    "youtube": "https://youtube.com",
    "twitter": "https://x.com"
  }'::jsonb,
  '{
    "metaTitle": "Studio Gizmo — Direção de Arte, Design & Tecnologia",
    "metaDescription": "Portfólio do Studio Gizmo: direção de arte, branding, campanhas de publicidade e soluções inovadoras em Inteligência Artificial.",
    "keywords": "studio gizmo, diretor de arte, design grafico, branding, publicidade, tecnologia, inteligencia artificial, marketing, sao paulo",
    "shareImage": "/src/assets/images/project_ai_branding_1786470608646.jpg"
  }'::jsonb,
  '{
    "logoText": "STUDIO GIZMO",
    "accentColor": "#c5a47e",
    "secondaryColor": "#10b981",
    "defaultTheme": "dark"
  }'::jsonb
where not exists (select 1 from public.settings);

-- Seed admin profile
insert into public.admin_profiles (id, user_id, name, email, password, auth_token, role)
select
  gen_random_uuid(),
  null,
  'Studio Gizmo',
  'admin@portfolio.com',
  'admin123',
  null,
  'admin'
where not exists (select 1 from public.admin_profiles where email = 'admin@portfolio.com');

-- Seed clients
insert into public.clients (id, name, slug, logo, segment, description, website, instagram, status, sort_order, created_at, updated_at)
values
  (
    'cli-1',
    'Aetheria AI Labs',
    'aetheria-ai-labs',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
    'Tecnologia & Inteligência Artificial',
    'Laboratório de pesquisas de IA generativa e inteligência de dados aplicada.',
    'https://aetheria.ai',
    '@aetheria.labs',
    'active',
    1,
    '2026-07-15T19:52:25.806Z',
    '2026-08-14T19:52:25.806Z'
  ),
  (
    'cli-2',
    'NEXUS Electric Mobility',
    'nexus-electric',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300&auto=format&fit=crop&q=80',
    'Automotivo & Mobilidade Sustentável',
    'Fabricante pioneira de veículos elétricos e soluções inteligentes de energia urbana.',
    'https://nexusev.com',
    '@nexusev',
    'active',
    2,
    '2026-07-20T19:52:25.806Z',
    '2026-08-14T19:52:25.806Z'
  ),
  (
    'cli-3',
    'Maison Noir Architecture',
    'maison-noir',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&auto=format&fit=crop&q=80',
    'Arquitetura & Design de Luxo',
    'Estúdio boutique internacional focado em projetos residenciais de altíssimo padrão.',
    'https://maisonnoir.arch',
    '@maisonnoir.arch',
    'active',
    3,
    '2026-07-25T19:52:25.806Z',
    '2026-08-14T19:52:25.806Z'
  ),
  (
    'cli-4',
    'Vanguard Media Group',
    'vanguard-media',
    'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=300&auto=format&fit=crop&q=80',
    'Publicidade & Entretenimento',
    'Conglomerado de mídia e produções audiovisuais contemporâneas.',
    'https://vanguardmedia.com',
    '@vanguardmedia',
    'active',
    4,
    '2026-07-30T19:52:25.806Z',
    '2026-08-14T19:52:25.806Z'
  )
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  logo = excluded.logo,
  segment = excluded.segment,
  description = excluded.description,
  website = excluded.website,
  instagram = excluded.instagram,
  status = excluded.status,
  sort_order = excluded.sort_order,
  updated_at = now();

-- Seed projects
insert into public.projects (
  id, title, slug, client_id, client_name, category, year, description, objective, solution,
  cover_image, gallery_images, video_url, external_url, tags, sort_order, status, featured,
  created_at, updated_at
)
values
  (
    'proj-1',
    'Aetheria AI Identity & GenAI Brand System',
    'aetheria-ai-identity',
    'cli-1',
    'Aetheria AI Labs',
    'Inteligência Artificial',
    '2026',
    'Sistema completo de marca e identidade visual dinâmica gerada em tempo real com algoritmos de IA para a startup de deeptech Aetheria.',
    'Desenvolver uma identidade de marca futurista e humana que transmitisse a altíssima precisão dos modelos generativos de linguagem e imagem sem parecer fria ou genérica.',
    'Criamos um ecossistema visual baseado em refração de luz, materiais translúcidos e tipografia orgânica. O logotipo responde em tempo real a estímulos sonoros em interações digitais.',
    '/src/assets/images/project_ai_branding_1786470608646.jpg',
    '[{"id":"img-1-1","url":"/src/assets/images/project_ai_branding_1786470608646.jpg","caption":"Composição principal do poster da marca Aetheria","sortOrder":1},{"id":"img-1-2","url":"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80","caption":"Tipografia tátil e gradientes fluidos","sortOrder":2},{"id":"img-1-3","url":"https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80","caption":"Painel interativo do ecossistema visual","sortOrder":3}]'::jsonb,
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://aetheria.ai',
    array['Brand Identity', 'Generative AI', '3D Motion', 'Design System', 'Tech'],
    1,
    'published',
    true,
    '2026-07-15T19:52:25.806Z',
    '2026-08-14T19:52:25.806Z'
  ),
  (
    'proj-2',
    'Maison Noir Minimalist Luxury Architecture Branding',
    'maison-noir-branding',
    'cli-3',
    'Maison Noir Architecture',
    'Branding',
    '2025',
    'Redesenho global de marca, editorial de alto padrão e sinalização arquitetônica para estúdio de luxo.',
    'Posicionar a Maison Noir como referência internacional em arquitetura brutalista contemporânea, unindo sobriedade e materiais nobres.',
    'Estruturação de um guia de marca rigoroso com papelaria deboss em algodão escuro, serifas clássicas customizadas e ensaios fotográficos com sombras naturais intensas.',
    '/src/assets/images/project_luxury_design_1786470621395.jpg',
    '[{"id":"img-2-1","url":"/src/assets/images/project_luxury_design_1786470621395.jpg","caption":"Papelaria e catálogo institucional em relevo seco","sortOrder":1},{"id":"img-2-2","url":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80","caption":"Guia editorial de materiais arquitetônicos","sortOrder":2}]'::jsonb,
    null,
    'https://maisonnoir.arch',
    array['Luxury Branding', 'Editorial Design', 'Typography', 'Architecture'],
    2,
    'published',
    true,
    '2026-07-21T19:52:25.806Z',
    '2026-08-14T19:52:25.806Z'
  ),
  (
    'proj-3',
    'NEXUS Hyper-Drive Motion & Launch Campaign',
    'nexus-hyper-drive-launch',
    'cli-2',
    'NEXUS Electric Mobility',
    'Motion Design',
    '2025',
    'Campanha 360° e direção de arte audiovisual para o lançamento global do SUV esportivo 100% elétrico NEXUS One.',
    'Capturar a energia pura da aceleração elétrica e gerar um buzz massivo nos meios digitais, DOOH e redes sociais no lançamento.',
    'Animações cinéticas em 3D, peças em mídias de alta definição urbana e trilha sonora sintetizada sob medida, resultando em mais de 10 milhões de impressões orgânicas.',
    '/src/assets/images/project_motion_campaign_1786470635949.jpg',
    '[{"id":"img-3-1","url":"/src/assets/images/project_motion_campaign_1786470635949.jpg","caption":"Frame principal da animação de abertura da campanha NEXUS","sortOrder":1},{"id":"img-3-2","url":"https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80","caption":"Painel digital DOOH veiculado em São Paulo e Nova York","sortOrder":2}]'::jsonb,
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://nexusev.com',
    array['Motion Graphics', 'Automotive', 'Campanha 360', '3D Render', 'Direção de Arte'],
    3,
    'published',
    true,
    '2026-07-27T19:52:25.807Z',
    '2026-08-14T19:52:25.807Z'
  ),
  (
    'proj-4',
    'Lucid Studio - NextGen AI Creative Suite',
    'lucid-studio-app',
    'cli-1',
    'Aetheria AI Labs',
    'Web Design',
    '2026',
    'Interface de plataforma web e experiência do usuário (UI/UX) para conjunto de ferramentas criativas alimentadas por IA.',
    'Projetar uma aplicação web ágil e livre de ruídos visuais para diretores de arte gerarem storyboards e palettes sob demanda.',
    'Concepção de layout escuro e refinado com componentes translúcidos, microinterações fluidas e navegação minimalista por teclado.',
    '/src/assets/images/project_tech_app_1786470650302.jpg',
    '[{"id":"img-4-1","url":"/src/assets/images/project_tech_app_1786470650302.jpg","caption":"Visão geral da dashboard criativa com widgets responsivos","sortOrder":1}]'::jsonb,
    null,
    'https://lucid-studio.app',
    array['UI/UX Design', 'Web Application', 'Dark Mode', 'Product Design', 'SaaS'],
    4,
    'published',
    false,
    '2026-08-02T19:52:25.807Z',
    '2026-08-14T19:52:25.807Z'
  ),
  (
    'proj-5',
    'Vanguard Cultural Manifesto & Social Campaign',
    'vanguard-cultural-manifesto',
    'cli-4',
    'Vanguard Media Group',
    'Campanhas',
    '2025',
    'Campanha integrada de posicionamento de marca celebrando a diversidade criativa do cinema e da propaganda independente.',
    'Reengajar a comunidade jovem criativa com uma mensagem autêntica e visceral sobre o futuro do audiovisual.',
    'Direção de fotografia documental com intervenções tipográficas em serigrafia física e pílulas de vídeo verticais para redes sociais.',
    'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=1200&auto=format&fit=crop&q=80',
    '[{"id":"img-5-1","url":"https://images.unsplash.com/photo-1542744094-3a31b272c490?w=1200&auto=format&fit=crop&q=80","caption":"Poster do Manifesto Vanguard","sortOrder":1}]'::jsonb,
    null,
    null,
    array['Campanha Integrada', 'Social Media', 'Fotografia', 'Direção de Arte'],
    5,
    'published',
    false,
    '2026-08-08T19:52:25.807Z',
    '2026-08-14T19:52:25.807Z'
  ),
  (
    'proj-6',
    'Kinetix Interactive Audio-Visual Installation',
    'kinetix-installation',
    'cli-4',
    'Vanguard Media Group',
    'Tecnologia',
    '2025',
    'Instalação imersiva de arte digital interativa apresentada na Bienal de Design Contemporâneo.',
    'Unir sensores de movimento, som generativo e projeção mapeada para explorar a relação entre corpo humano e dados digitais.',
    'Programação de particuladores em tempo real conectados a câmeras de profundidade e sintetizadores modulados.',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    '[{"id":"img-6-1","url":"https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80","caption":"Instalação imersiva em tempo real","sortOrder":1}]'::jsonb,
    null,
    null,
    array['Interactive Art', 'Creative Coding', 'Projeção Mapeada', 'Experiência Imersiva'],
    6,
    'published',
    false,
    '2026-08-12T19:52:25.807Z',
    '2026-08-14T19:52:25.807Z'
  )
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  client_id = excluded.client_id,
  client_name = excluded.client_name,
  category = excluded.category,
  year = excluded.year,
  description = excluded.description,
  objective = excluded.objective,
  solution = excluded.solution,
  cover_image = excluded.cover_image,
  gallery_images = excluded.gallery_images,
  video_url = excluded.video_url,
  external_url = excluded.external_url,
  tags = excluded.tags,
  sort_order = excluded.sort_order,
  status = excluded.status,
  featured = excluded.featured,
  updated_at = now();

-- Seed messages
insert into public.messages (
  id, name, email, phone, company, subject, message, status, created_at, updated_at
)
values
  (
    'msg-1',
    'Carolina Mendonça',
    'carolina.m@agenciamuse.com.br',
    '+55 11 99123-8899',
    'Agência Muse',
    'Direção de Arte para nova campanha de Verão',
    'Olá Gabriel, gostamos muito do seu portfólio e dos seus projetos com IA e Motion Design. Temos uma demanda para a direção de arte da campanha de lançamento da coleção de Verão da nossa cliente. Você teria disponibilidade para uma reunião na próxima quinta-feira?',
    'unread',
    '2026-08-14T16:52:25.807Z',
    '2026-08-14T16:52:25.807Z'
  ),
  (
    'msg-2',
    'Fernando Rocha',
    'fernando@rochafinance.com',
    '+55 21 98877-1122',
    'Rocha Capital',
    'Projeto de Rebranding Completo',
    'Prezado Gabriel, precisamos reformular totalmente a identidade visual do nosso grupo financeiro, agregando uma linguagem mais tecnológica e moderna. Gostaria de solicitar um orçamento para o rebranding e o manual de marca.',
    'read',
    '2026-08-13T19:52:25.807Z',
    '2026-08-13T19:52:25.807Z'
  ),
  (
    'msg-3',
    'Beatriz Lima',
    'b.lima@techfounders.io',
    '+55 41 97766-5544',
    'Tech Founders Hub',
    'Palestra sobre Inteligência Artificial e Design',
    'Olá Gabriel, acompanhamos o case da Aetheria AI e gostaríamos de te convidar para ser o palestrante principal do nosso evento de inovação criativa no mês que vem.',
    'replied',
    '2026-08-12T19:52:25.807Z',
    '2026-08-12T19:52:25.807Z'
  )
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  company = excluded.company,
  subject = excluded.subject,
  message = excluded.message,
  status = excluded.status,
  updated_at = now();

-- RLS
alter table public.projects enable row level security;
alter table public.clients enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;
alter table public.admin_profiles enable row level security;

-- Public read access
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
on public.projects
for select
using (status = 'published');

drop policy if exists "Public can read active clients" on public.clients;
create policy "Public can read active clients"
on public.clients
for select
using (status = 'active');

drop policy if exists "Public can read settings" on public.settings;
create policy "Public can read settings"
on public.settings
for select
using (true);

drop policy if exists "Public can insert messages" on public.messages;
create policy "Public can insert messages"
on public.messages
for insert
with check (true);

-- Admin access policies
drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects"
on public.projects
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage clients" on public.clients;
create policy "Admins can manage clients"
on public.clients
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage messages" on public.messages;
create policy "Admins can manage messages"
on public.messages
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage settings" on public.settings;
create policy "Admins can manage settings"
on public.settings
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Admins can manage admin profiles" on public.admin_profiles;
create policy "Admins can manage admin profiles"
on public.admin_profiles
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
