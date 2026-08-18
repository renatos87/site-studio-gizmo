import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Menu, X, Shield, Lock, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, settings, activeSection, navigateToSection, isAdmin } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Início' },
    { id: 'about', label: 'Sobre' },
    { id: 'works', label: 'Trabalhos' },
    { id: 'clients', label: 'Clientes' },
    { id: 'contact', label: 'Contato' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    navigateToSection(id);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#050505]/80 border-b border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo / Text */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-[#c5a47e]/40 flex items-center justify-center text-[#c5a47e] font-serif font-bold text-xl group-hover:scale-105 group-hover:border-[#c5a47e] transition-all">
            {settings.personalInfo?.name?.[0] || 'S'}
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-semibold text-base sm:text-lg tracking-tight text-[#f9f9f9] group-hover:text-[#c5a47e] transition-colors">
              {settings.appearance?.logoText || settings.personalInfo?.name || 'STUDIO GIZMO'}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#c5a47e]/80">
              Marketing Digital e Gestão de IA
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/10">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 text-xs uppercase tracking-[0.15em] font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-[#050505] font-bold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-[#c5a47e] rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Alternar modo claro e escuro"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 border border-white/10 transition-all focus:outline-none"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#c5a47e] transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-white/80 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Admin Toggle Button */}
          <button
            onClick={() => handleNavClick('admin')}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.15em] transition-all border ${
              activeSection === 'admin'
                ? 'bg-[#c5a47e] text-[#050505] border-[#c5a47e] shadow-lg shadow-[#c5a47e]/20 font-bold'
                : isAdmin
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-white/[0.03] text-[#f9f9f9] border-white/10 hover:border-[#c5a47e]/50 hover:text-[#c5a47e]'
            }`}
          >
            {isAdmin ? <Shield className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-[#c5a47e]" />}
            <span>{isAdmin ? 'Painel Admin' : 'Área Restrita'}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:bg-white/5 border border-white/10"
            aria-label="Menu Principal"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#c5a47e]" /> : <Menu className="w-5 h-5 text-white/80" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-white/10 bg-[#050505]/95 backdrop-blur-2xl px-6 py-6"
          >
            <div className="flex flex-col gap-3">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs uppercase tracking-[0.15em] font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-[#c5a47e] text-[#050505] font-bold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </button>
              ))}

              <div className="pt-4 border-t border-white/10 mt-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.05] border border-[#c5a47e]/40 text-[#c5a47e] text-xs font-bold uppercase tracking-[0.15em] shadow-md"
                >
                  {isAdmin ? <Shield className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{isAdmin ? 'Acessar Painel Admin' : 'Área Administrativa (/admin)'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
