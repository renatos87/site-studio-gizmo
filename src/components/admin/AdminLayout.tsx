import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, FolderKanban, Users, MessageSquare, Settings, ExternalLink, LogOut, Shield, Sun, Moon, Menu, X, Plus } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProjects } from './AdminProjects';
import { AdminClients } from './AdminClients';
import { AdminMessages } from './AdminMessages';
import { AdminSettings } from './AdminSettings';

export const AdminLayout: React.FC = () => {
  const { adminUser, logoutAdmin, setActiveSection, theme, toggleTheme, messages } = usePortfolio();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'clients' | 'messages' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openNewProjectModal, setOpenNewProjectModal] = useState(false);
  const [openNewClientModal, setOpenNewClientModal] = useState(false);

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Trabalhos', icon: FolderKanban },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare, badge: unreadCount },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#f9f9f9] flex flex-col md:flex-row font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0a0a0a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#c5a47e]" />
          <span className="font-serif font-bold text-sm tracking-widest text-[#f9f9f9]">PAINEL ADMIN</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-white/50 hover:text-white"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#c5a47e]" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#0a0a0a] border-r border-white/10 p-6 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          
          {/* Admin Header Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#c5a47e] text-[#050505] flex items-center justify-center font-serif font-bold text-lg shadow-lg shadow-[#c5a47e]/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif font-bold text-sm tracking-[0.15em] text-[#f9f9f9]">LUCID ADMIN</p>
              <p className="text-[10px] text-[#c5a47e] font-semibold uppercase tracking-[0.15em]">{adminUser?.name || 'Administrador'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs uppercase tracking-[0.15em] font-bold transition-all ${
                    active
                      ? 'bg-[#c5a47e] text-[#050505] shadow-lg shadow-[#c5a47e]/20'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#c5a47e] text-[#050505] text-[10px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveSection('home')}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white/80 font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#c5a47e]" />
            <span>Ver Site Público</span>
          </button>

          <button
            onClick={logoutAdmin}
            className="w-full py-2.5 px-4 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors border border-red-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              onNavigateTab={tab => setActiveTab(tab as any)}
              onOpenNewProject={() => {
                setActiveTab('projects');
                setOpenNewProjectModal(true);
              }}
              onOpenNewClient={() => {
                setActiveTab('clients');
                setOpenNewClientModal(true);
              }}
            />
          )}

          {activeTab === 'projects' && (
            <AdminProjects
              openCreateModalDirectly={openNewProjectModal}
              onModalClosed={() => setOpenNewProjectModal(false)}
            />
          )}

          {activeTab === 'clients' && (
            <AdminClients
              openCreateModalDirectly={openNewClientModal}
              onModalClosed={() => setOpenNewClientModal(false)}
            />
          )}

          {activeTab === 'messages' && <AdminMessages />}

          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </main>

    </div>
  );
};
