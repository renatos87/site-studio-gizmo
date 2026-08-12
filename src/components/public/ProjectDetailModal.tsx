import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, ChevronLeft, ChevronRight, Play, ZoomIn, Calendar, Building, Tag, Award, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const ProjectDetailModal: React.FC = () => {
  const { selectedProject, setSelectedProject, projects } = usePortfolio();
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null);

  if (!selectedProject) return null;

  // Find index and previous / next projects
  const publishedProjects = projects.filter(p => p.status === 'published');
  const currentIndex = publishedProjects.findIndex(p => p.id === selectedProject.id);
  
  const prevProject =
    currentIndex > 0
      ? publishedProjects[currentIndex - 1]
      : publishedProjects[publishedProjects.length - 1];

  const nextProject =
    currentIndex < publishedProjects.length - 1
      ? publishedProjects[currentIndex + 1]
      : publishedProjects[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-0 sm:p-6 lg:p-10">
        
        {/* Main Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-5xl min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-y-auto overflow-x-hidden flex flex-col justify-between text-white"
        >
          {/* Top Sticky Header */}
          <div className="sticky top-0 z-30 px-6 py-4 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#c5a47e]/15 border border-[#c5a47e]/30 text-[#c5a47e] text-[10px] font-bold uppercase tracking-[0.15em]">
                {selectedProject.category}
              </span>
              <span className="text-xs text-white/50 font-serif italic">• {selectedProject.year}</span>
            </div>

            <button
              onClick={() => setSelectedProject(null)}
              className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 text-white/70 hover:text-white hover:border-[#c5a47e] flex items-center justify-center transition-colors focus:outline-none"
              title="Voltar para trabalhos"
            >
              <X className="w-5 h-5 text-[#c5a47e]" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-10 space-y-12">
            
            {/* Title & Metadata */}
            <div className="space-y-4 font-sans">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">
                <span className="flex items-center gap-1.5 text-[#c5a47e] font-bold">
                  <Building className="w-4 h-4 text-[#c5a47e]" />
                  {selectedProject.clientName || 'Cliente Confidencial'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-white/60">
                  <Calendar className="w-4 h-4 text-white/40" />
                  {selectedProject.year}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#f9f9f9] tracking-tight leading-tight">
                {selectedProject.title}
              </h1>

              {selectedProject.externalUrl && (
                <div className="pt-2">
                  <a
                    href={selectedProject.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c5a47e] hover:bg-[#b3926c] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] shadow-lg transition-colors"
                  >
                    <span>Acessar Projeto Externo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Main Cover Image */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#050505] border border-white/10">
              <img
                src={selectedProject.coverImage}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Description, Objective, Solution */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
              
              {/* Left Overview */}
              <div className="md:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">
                    Resumo do Projeto
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed font-sans">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Tags */}
                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div className="space-y-2 font-sans">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Tags & Especialidades</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-xs text-white/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Objective & Solution */}
              <div className="md:col-span-7 space-y-6 font-sans">
                {selectedProject.objective && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e] flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#c5a47e]" />
                      <span>Objetivo</span>
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                      {selectedProject.objective}
                    </p>
                  </div>
                )}

                {selectedProject.solution && (
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#c5a47e]" />
                      <span>Solução Desenvolvida</span>
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                      {selectedProject.solution}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Gallery Section */}
            {selectedProject.galleryImages && selectedProject.galleryImages.length > 0 && (
              <div className="space-y-6 pt-8 border-t border-white/10">
                <h3 className="text-lg font-serif text-[#f9f9f9]">
                  Galeria do Projeto
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProject.galleryImages.map((imgItem, idx) => (
                    <div
                      key={imgItem.id || idx}
                      onClick={() => setActiveGalleryImage(imgItem.url)}
                      className="group relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#050505] border border-white/10 cursor-pointer shadow-md hover:border-[#c5a47e]/50 transition-all"
                    >
                      <img
                        src={imgItem.url}
                        alt={imgItem.caption || `Imagem ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-[#050505]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-3 rounded-full bg-[#c5a47e] text-[#050505] shadow-lg">
                          <ZoomIn className="w-5 h-5" />
                        </div>
                      </div>
                      {imgItem.caption && (
                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#050505]/90 to-transparent text-[11px] font-medium text-white/80 line-clamp-1">
                          {imgItem.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Embedded Video */}
            {selectedProject.videoUrl && (
              <div className="space-y-4 pt-8 border-t border-white/10">
                <h3 className="text-lg font-serif text-[#f9f9f9] flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#c5a47e]" />
                  <span>Apresentação em Vídeo</span>
                </h3>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#050505] border border-white/10 shadow-xl">
                  <iframe
                    src={selectedProject.videoUrl}
                    title={selectedProject.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

          </div>

          {/* Bottom Sticky Navigation Bar */}
          <div className="sticky bottom-0 z-30 px-6 py-4 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-4 font-sans">
            
            <button
              onClick={() => setSelectedProject(prevProject)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/60 hover:text-[#c5a47e] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Projeto Anterior</span>
            </button>

            <button
              onClick={() => setSelectedProject(null)}
              className="px-5 py-2.5 rounded-full bg-[#c5a47e] text-[#050505] text-xs font-bold uppercase tracking-[0.15em] shadow-md hover:bg-[#b3926c]"
            >
              Voltar para Trabalhos
            </button>

            <button
              onClick={() => setSelectedProject(nextProject)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/60 hover:text-[#c5a47e] transition-colors"
            >
              <span className="hidden sm:inline">Próximo Projeto</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>

        </motion.div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {activeGalleryImage && (
            <div
              onClick={() => setActiveGalleryImage(null)}
              className="fixed inset-0 z-50 bg-zinc-950/95 flex items-center justify-center p-4 cursor-zoom-out"
            >
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                src={activeGalleryImage}
                alt="Imagem Ampliada"
                className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setActiveGalleryImage(null)}
                className="absolute top-6 right-6 p-3 rounded-full bg-zinc-800 text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
};
