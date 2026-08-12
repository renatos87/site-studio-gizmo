import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Briefcase, GraduationCap, Cpu, Layers, Palette, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const About: React.FC = () => {
  const { settings } = usePortfolio();
  const [modalOpen, setModalOpen] = useState(false);

  const personal = settings.personalInfo || {};

  const specialties = [
    {
      icon: Palette,
      title: 'Direção de Arte & Branding',
      desc: 'Sistemas de identidade visual, tipografia editorial e posicionamento estético de alto nível.',
    },
    {
      icon: Cpu,
      title: 'Inteligência Artificial & GenAI',
      desc: 'Criação assistida por IA, engenharia de prompts avançada e workflows de síntese visual.',
    },
    {
      icon: Layers,
      title: 'Campanhas 360° & Publicidade',
      desc: 'Estratégias criativas integrando mídias digitais, DOOH, motion graphics e audiovisual.',
    },
    {
      icon: Briefcase,
      title: 'Design de Produtos Digitais',
      desc: 'Interfaces UI/UX web e mobile limpas, responsivas e focadas na experiência do usuário.',
    },
  ];

  const timeline = [
    {
      year: '2023 - Presente',
      role: 'Head of Creative & AI Strategy',
      company: 'Studio Global',
      desc: 'Liderando a integração de modelos de IA e direção de arte para clientes internacionais.',
    },
    {
      year: '2020 - 2023',
      role: 'Diretor de Arte Senior',
      company: 'Agência Vanguard',
      desc: 'Responsável por campanhas nacionais de grandes marcas de mobilidade e tecnologia.',
    },
    {
      year: '2017 - 2020',
      role: 'Brand & Graphic Designer Lead',
      company: 'Maison Creative',
      desc: 'Desenvolvimento de ecossistemas visuais completos e diretrizes de marca.',
    },
  ];

  return (
    <section id="about" className="py-20 md:py-32 bg-[#050505] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">
              01 / Apresentação
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#f9f9f9]">
              Sobre o Profissional
            </h2>
          </div>
          <p className="text-sm sm:text-base text-white/60 max-w-md font-sans">
            Visualidade forte, clareza estratégica e execução técnica rigorosa em cada detalhe.
          </p>
        </div>

        {/* Structured Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Info Card */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-white/[0.02] border border-white/10 shadow-xl flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-[#c5a47e]/40 text-[#c5a47e] flex items-center justify-center font-serif font-bold text-2xl">
                {personal.name?.[0] || 'S'}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-semibold text-[#f9f9f9]">{personal.name || 'Studio Gizmo'}</h3>
                <p className="text-xs uppercase tracking-[0.2em] font-medium text-[#c5a47e]">{personal.role}</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-sans">
                {personal.bio ||
                  'Mais de 10 anos liderando campanhas criativas, identidades visuais de alto impacto e integrações de tecnologia e Inteligência Artificial para marcas globais.'}
              </p>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#c5a47e] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#b3926c] transition-colors shadow-lg shadow-[#c5a47e]/15"
              >
                <span>Conheça minha trajetória</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Specializations Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specialties.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-md hover:border-[#c5a47e]/40 transition-all space-y-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#c5a47e]/10 border border-[#c5a47e]/20 text-[#c5a47e] flex items-center justify-center group-hover:bg-[#c5a47e] group-hover:text-[#050505] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif font-semibold text-[#f9f9f9]">{item.title}</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Trajectory Modal / Drawer */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#050505]/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-8 my-8 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">Trajetória Profissional</span>
                  <h3 className="text-2xl font-serif text-[#f9f9f9] mt-1">Experiência & Formação</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                >
                  <X className="w-5 h-5 text-[#c5a47e]" />
                </button>
              </div>

              {/* Timeline */}
              <div className="space-y-6">
                <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-[#c5a47e] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#c5a47e]" />
                  <span>Histórico de Carreira</span>
                </h4>
                <div className="space-y-6 pl-2 border-l border-white/10">
                  {timeline.map((item, index) => (
                    <div key={index} className="relative pl-6 space-y-1">
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#c5a47e] border-4 border-[#0a0a0a]" />
                      <span className="text-xs font-bold text-[#c5a47e] tracking-wider">{item.year}</span>
                      <h5 className="text-base font-serif font-semibold text-[#f9f9f9]">{item.role} • {item.company}</h5>
                      <p className="text-xs text-white/60 font-sans">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h4 className="text-xs uppercase font-bold tracking-[0.2em] text-[#c5a47e] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#c5a47e]" />
                  <span>Formação & Certificações</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <p className="text-xs font-bold text-[#f9f9f9]">Bacharelado em Publicidade e Propaganda</p>
                    <p className="text-[11px] text-white/50 mt-0.5">ESPM / USP • Especialização em Direção de Arte</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <p className="text-xs font-bold text-[#f9f9f9]">Especialista em GenAI & Deep Learning</p>
                    <p className="text-[11px] text-white/50 mt-0.5">Google Cloud / MIT Executive Education</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#c5a47e] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#b3926c]"
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
