import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Eye, ArrowUpRight, Sparkles, Tag } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Category, Project } from '../../types';

export const WorksGrid: React.FC = () => {
  const { projects, setSelectedProject } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'Todos',
    'Branding',
    'Identidade Visual',
    'Direção de Arte',
    'Design Gráfico',
    'Social Media',
    'Campanhas',
    'Motion Design',
    'Marketing',
    'Tecnologia',
    'Inteligência Artificial',
    'Web Design',
  ];

  // Filter published projects
  const publishedProjects = projects.filter(p => p.status === 'published');

  const filteredProjects = publishedProjects.filter(project => {
    const matchesCategory =
      selectedCategory === 'Todos' || project.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      (project.clientName && project.clientName.toLowerCase().includes(query)) ||
      project.tags.some(t => t.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="works" className="py-20 md:py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">
              02 / Portfolio Showcase
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#f9f9f9]">
              Trabalhos Selecionados
            </h2>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por projeto, tag, cliente..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/[0.03] border border-white/10 text-xs text-[#f9f9f9] placeholder-white/40 focus:outline-none focus:border-[#c5a47e] transition-all"
            />
          </div>
        </div>

        {/* Category Filters Carousel / Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-medium whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-[#c5a47e] text-[#050505] font-bold shadow-md scale-[1.02]'
                    : 'bg-white/[0.03] text-white/60 border border-white/10 hover:text-white hover:border-[#c5a47e]/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
            <Filter className="w-8 h-8 text-[#c5a47e]/60 mx-auto" />
            <p className="text-sm font-medium text-white/60">
              Nenhum projeto encontrado nesta categoria ou busca.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
              }}
              className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e] underline"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedProject(project)}
                  className="group cursor-pointer rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden shadow-xl hover:border-[#c5a47e]/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0a]">
                    <img
                      src={project.coverImage || 'https://picsum.photos/800/600'}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Category & Featured Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#050505]/80 backdrop-blur-md border border-white/10 text-[#f9f9f9] text-[10px] uppercase font-bold tracking-[0.15em]">
                        {project.category}
                      </span>
                      {project.featured && (
                        <span className="px-2.5 py-1 rounded-full bg-[#c5a47e]/20 backdrop-blur-md border border-[#c5a47e]/40 text-[#c5a47e] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#c5a47e]" />
                          <span>Destaque</span>
                        </span>
                      )}
                    </div>

                    {/* Hover View Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#050505]/50 backdrop-blur-[2px]">
                      <div className="px-5 py-2.5 rounded-full bg-[#c5a47e] text-[#050505] text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 shadow-2xl scale-95 group-hover:scale-100 transition-transform">
                        <Eye className="w-4 h-4" />
                        <span>Ver Projeto</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 text-[#c5a47e] text-xs font-serif italic">
                      {project.year}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#c5a47e] tracking-[0.2em]">
                          {project.clientName || 'Cliente Confidencial'}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#c5a47e] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                      <h3 className="text-lg font-serif font-semibold text-[#f9f9f9] group-hover:text-[#c5a47e] transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed font-sans">
                        {project.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/10">
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-md bg-white/[0.03] border border-white/5 text-[10px] font-medium text-white/50"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </section>
  );
};
