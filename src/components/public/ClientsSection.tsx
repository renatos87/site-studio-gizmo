import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Instagram, ExternalLink, FolderKanban, X, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Client, Project } from '../../types';

export const ClientsSection: React.FC = () => {
  const { clients, projects, setSelectedProject } = usePortfolio();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const activeClients = clients.filter(c => c.status === 'active');

  // Filter projects associated with client
  const clientProjects = selectedClient
    ? projects.filter(p => p.clientId === selectedClient.id || p.clientName === selectedClient.name)
    : [];

  return (
    <section id="clients" className="py-20 md:py-32 bg-[#050505] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">
              03 / Marcas & Parceiros
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#f9f9f9]">
              Clientes Atendidos
            </h2>
          </div>
          <p className="text-sm sm:text-base text-white/60 max-w-md font-sans">
            Parcerias estratégicas construídas com líderes de tecnologia, mobilidade, luxo e mídia.
          </p>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeClients.map((client, index) => {
            const linkedCount = projects.filter(
              p => p.clientId === client.id || p.clientName === client.name
            ).length;

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => setSelectedClient(client)}
                className="group cursor-pointer p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-xl hover:shadow-2xl hover:border-[#c5a47e]/50 transition-all space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] p-3 flex items-center justify-center border border-white/10 group-hover:border-[#c5a47e]/40 group-hover:scale-105 transition-all">
                    <img
                      src={client.logo || 'https://picsum.photos/200/200'}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain rounded-lg filter grayscale brightness-120 group-hover:grayscale-0 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#c5a47e] tracking-[0.2em]">
                      {client.segment}
                    </span>
                    <h3 className="text-lg font-serif font-semibold text-[#f9f9f9] group-hover:text-[#c5a47e] transition-colors">
                      {client.name}
                    </h3>
                  </div>

                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed font-sans">
                    {client.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-medium text-white/50">
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-[#c5a47e]" />
                    <span>{linkedCount} {linkedCount === 1 ? 'Projeto' : 'Projetos'}</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-[#c5a47e] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#050505]/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-white"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 p-2 flex items-center justify-center">
                    <img
                      src={selectedClient.logo}
                      alt={selectedClient.name}
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">
                      {selectedClient.segment}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif text-[#f9f9f9]">
                      {selectedClient.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedClient(null)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                >
                  <X className="w-5 h-5 text-[#c5a47e]" />
                </button>
              </div>

              {/* Description & Links */}
              <div className="space-y-4 font-sans">
                <p className="text-sm text-white/70 leading-relaxed">
                  {selectedClient.description}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  {selectedClient.website && (
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white hover:border-[#c5a47e] hover:text-[#c5a47e] transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#c5a47e]" />
                      <span>{selectedClient.website.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  )}

                  {selectedClient.instagram && (
                    <a
                      href={`https://instagram.com/${selectedClient.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white hover:border-[#c5a47e] hover:text-[#c5a47e] transition-colors"
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#c5a47e]" />
                      <span>{selectedClient.instagram}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Associated Projects */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-[#c5a47e]">
                  Trabalhos Desenvolvidos para este Cliente ({clientProjects.length})
                </h4>

                {clientProjects.length === 0 ? (
                  <p className="text-xs text-white/40 italic font-sans">Nenhum projeto específico associado a esta marca ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {clientProjects.map(proj => (
                      <div
                        key={proj.id}
                        onClick={() => {
                          setSelectedClient(null);
                          setSelectedProject(proj);
                        }}
                        className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-[#c5a47e]/10 border border-white/10 hover:border-[#c5a47e]/40 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={proj.coverImage}
                            alt={proj.title}
                            className="w-10 h-10 rounded-xl object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="text-xs font-serif font-semibold text-[#f9f9f9] line-clamp-1">{proj.title}</p>
                            <span className="text-[10px] text-white/50">{proj.category} • {proj.year}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-[#c5a47e]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-6 py-2 rounded-xl bg-[#c5a47e] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#b3926c]"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
