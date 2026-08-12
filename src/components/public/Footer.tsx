import React from 'react';
import { Shield, Lock, ArrowUp } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const Footer: React.FC = () => {
  const { settings, setActiveSection, isAdmin } = usePortfolio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/10 bg-[#050505] text-white/60 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-[#c5a47e]/40 flex items-center justify-center text-[#c5a47e] font-serif font-bold text-sm">
              {settings.personalInfo?.name?.[0] || 'S'}
            </div>
            <span className="font-serif font-bold text-sm tracking-[0.15em] text-[#f9f9f9]">
              {settings.appearance?.logoText || settings.personalInfo?.name || 'STUDIO GIZMO'}
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-[0.15em] font-medium">
            <button onClick={() => setActiveSection('home')} className="hover:text-[#c5a47e] transition-colors">
              Início
            </button>
            <button onClick={() => setActiveSection('about')} className="hover:text-[#c5a47e] transition-colors">
              Sobre
            </button>
            <button onClick={() => setActiveSection('works')} className="hover:text-[#c5a47e] transition-colors">
              Trabalhos
            </button>
            <button onClick={() => setActiveSection('clients')} className="hover:text-[#c5a47e] transition-colors">
              Clientes
            </button>
            <button onClick={() => setActiveSection('contact')} className="hover:text-[#c5a47e] transition-colors">
              Contato
            </button>
            <button
              onClick={() => setActiveSection('admin')}
              className="text-[#c5a47e] hover:underline flex items-center gap-1 font-bold"
            >
              {isAdmin ? <Shield className="w-3 h-3 text-[#c5a47e]" /> : <Lock className="w-3 h-3 text-[#c5a47e]" />}
              <span>Painel Admin</span>
            </button>
          </div>

          {/* Scroll Top Button */}
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-full bg-white/[0.03] border border-white/10 text-[#c5a47e] hover:border-[#c5a47e]/50 hover:bg-white/[0.08] transition-colors"
            title="Voltar ao topo"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4">
          <p>© {new Date().getFullYear()} {settings.personalInfo?.name || 'Studio Gizmo'}. Todos os direitos reservados.</p>
          <p className="tracking-wider">Publicidade • Design Gráfico • Direção de Arte • Tecnologia & IA</p>
        </div>

      </div>
    </footer>
  );
};
