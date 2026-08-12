import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, FolderKanban, Users, MessageSquare, Plus, ExternalLink, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewProject: () => void;
  onOpenNewClient: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenNewProject,
  onOpenNewClient,
}) => {
  const { projects, clients, messages, setActiveSection, updateMessageStatusById } = usePortfolio();

  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.status === 'published').length;
  const draftProjects = projects.filter(p => p.status === 'draft').length;
  const totalClients = clients.length;
  const totalMessages = messages.length;
  const unreadMessages = messages.filter(m => m.status === 'unread').length;

  const recentProjects = projects.slice(0, 4);
  const recentMessages = messages.slice(0, 4);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Welcome Banner */}
      <div className="p-8 rounded-3xl bg-[#0a0a0a] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a47e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a47e]/15 border border-[#c5a47e]/30 text-[#c5a47e] text-[10px] font-bold uppercase tracking-[0.15em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Painel Administrativo Ativo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#f9f9f9]">
            Visão Geral do Portfólio
          </h1>
          <p className="text-xs text-white/60 max-w-xl font-sans">
            Gerencie seus trabalhos, marcas parceiras, mensagens de contatos recebidas e configurações públicas do site em um só lugar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={onOpenNewProject}
            className="px-4 py-2.5 rounded-xl bg-[#c5a47e] hover:bg-[#b3926c] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] transition-colors shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Trabalho</span>
          </button>

          <button
            onClick={() => setActiveSection('home')}
            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs uppercase tracking-[0.15em] transition-colors flex items-center gap-2"
          >
            <span>Ver Site Público</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#c5a47e]" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c5a47e]">Total de Trabalhos</span>
            <div className="w-10 h-10 rounded-2xl bg-[#c5a47e]/10 text-[#c5a47e] border border-[#c5a47e]/20 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif text-[#f9f9f9]">{totalProjects}</p>
          <div className="flex items-center gap-3 text-[11px] font-medium text-white/50">
            <span className="text-emerald-400">{publishedProjects} Publicados</span>
            <span>•</span>
            <span className="text-amber-400">{draftProjects} Rascunhos</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c5a47e]">Clientes Atendidos</span>
            <div className="w-10 h-10 rounded-2xl bg-[#c5a47e]/10 text-[#c5a47e] border border-[#c5a47e]/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif text-[#f9f9f9]">{totalClients}</p>
          <p className="text-[11px] text-white/50 font-medium">Marcas cadastradas no ecossistema</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c5a47e]">Mensagens Recebidas</span>
            <div className="w-10 h-10 rounded-2xl bg-[#c5a47e]/10 text-[#c5a47e] border border-[#c5a47e]/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif text-[#f9f9f9]">{totalMessages}</p>
          <p className="text-[11px] text-white/50 font-medium">Contatos via formulário do site</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400">Mensagens Não Lidas</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-serif text-amber-400">{unreadMessages}</p>
          <p className="text-[11px] text-white/50 font-medium">Requer atenção ou resposta</p>
        </div>

      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Recent Projects */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-serif text-[#f9f9f9]">Trabalhos Recentes</h3>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e] hover:underline"
            >
              Ver Todos ({totalProjects})
            </button>
          </div>

          <div className="space-y-3">
            {recentProjects.map(proj => (
              <div
                key={proj.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={proj.coverImage}
                    alt={proj.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#f9f9f9] line-clamp-1">{proj.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/50 font-medium">
                      <span>{proj.category}</span>
                      <span>•</span>
                      <span>{proj.clientName || 'Geral'}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] ${
                    proj.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {proj.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Recent Messages */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-serif text-[#f9f9f9]">Mensagens Recentes</h3>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e] hover:underline"
            >
              Ver Caixa de Entrada ({totalMessages})
            </button>
          </div>

          <div className="space-y-3">
            {recentMessages.length === 0 ? (
              <p className="text-xs text-white/40 italic py-6 text-center font-serif">Nenhuma mensagem recebida ainda.</p>
            ) : (
              recentMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-2xl border transition-colors space-y-2 ${
                    msg.status === 'unread'
                      ? 'bg-[#c5a47e]/5 border-[#c5a47e]/30'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#f9f9f9]">{msg.name}</span>
                    <span className="text-[10px] text-white/40">
                      {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white/80 line-clamp-1">
                    {msg.subject || 'Contato'}
                  </p>
                  <p className="text-[11px] text-white/50 line-clamp-2">
                    {msg.message}
                  </p>

                  {msg.status === 'unread' && (
                    <div className="pt-1 text-right">
                      <button
                        onClick={() => updateMessageStatusById(msg.id, 'read')}
                        className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#c5a47e] hover:underline"
                      >
                        Marcar como lida
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
