import React from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight, Sparkles, MessageSquare, Award, Terminal, Compass } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const Hero: React.FC = () => {
  const { settings, setActiveSection, projects } = usePortfolio();

  const handleScrollToWorks = () => {
    setActiveSection('works');
    const el = document.getElementById('works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToContact = () => {
    setActiveSection('contact');
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const personal = settings.personalInfo || {};

  return (
    <section id="home" className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-[#050505]">
      {/* Background Accent Elements - Warm Gold Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#c5a47e]/15 via-amber-500/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-[#c5a47e]/30 text-xs font-medium uppercase tracking-[0.2em] text-[#c5a47e] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#c5a47e] animate-pulse" />
              <span>{personal.role || 'Diretor de Arte & Estrategista de IA'}</span>
            </div>

            {/* Name & Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-[#f9f9f9] leading-[1.05]">
                {personal.name || 'Studio Gizmo'}
              </h1>
              <p className="text-xl sm:text-2xl lg:text-3xl font-serif italic text-white/80 leading-snug">
                {personal.heroTagline ||
                  'Publicidade, Design, Marketing e Tecnologia para transformar ideias em experiências.'}
              </p>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed font-sans">
              {personal.heroDescription ||
                'Especialista na fusão de direção de arte conceitual, design moderno e inteligência artificial aplicada à comunicação de marcas extraordinárias.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleScrollToWorks}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#c5a47e] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] shadow-xl shadow-[#c5a47e]/20 hover:bg-[#b3926c] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span>Ver Trabalhos</span>
                <ArrowDownRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={handleScrollToContact}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white/[0.03] text-[#f9f9f9] font-bold text-xs uppercase tracking-[0.15em] border border-white/10 hover:border-[#c5a47e]/50 hover:text-[#c5a47e] transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4 text-[#c5a47e]" />
                <span>Entre em contato</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6">
              <div>
                <p className="text-2xl sm:text-4xl font-serif font-bold text-[#c5a47e]">10+</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/50 mt-1">Anos de Experiência</p>
              </div>
              <div>
                <p className="text-2xl sm:text-4xl font-serif font-bold text-[#c5a47e]">{projects.length}+</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/50 mt-1">Projetos Executados</p>
              </div>
              <div>
                <p className="text-2xl sm:text-4xl font-serif font-bold text-[#c5a47e]">100%</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-white/50 mt-1">Foco Criativo & IA</p>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#0a0a0a] shadow-2xl border border-white/10 group">
              <img
                src={personal.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'}
                alt={personal.name || 'Studio Gizmo'}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />

              {/* Overlay Tags */}
              <div className="absolute top-6 right-6">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#050505]/80 backdrop-blur-md border border-[#c5a47e]/30 text-[#c5a47e] text-xs font-medium tracking-wider shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a47e]" />
                  <span>Art Direction & AI</span>
                </div>
              </div>

              {/* Bottom Card Overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#050505]/90 backdrop-blur-xl border border-white/10 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">Posicionamento</span>
                  <Award className="w-4 h-4 text-[#c5a47e]" />
                </div>
                <p className="text-xs font-serif italic text-white/90 leading-snug">
                  "Conectando marcas globais com estética de vanguarda e inteligência sintética."
                </p>
              </div>
            </div>

            {/* Floating Badge 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 p-4 rounded-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-2xl text-white text-xs font-medium"
            >
              <div className="w-9 h-9 rounded-xl bg-[#c5a47e]/10 border border-[#c5a47e]/30 text-[#c5a47e] flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Tech & Prompt Engineering</p>
                <p className="text-white/50 text-[10px]">Modelos GenAI Customizados</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
