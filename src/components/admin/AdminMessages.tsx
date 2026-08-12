import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mail, Phone, Building, Calendar, CheckCircle2, Archive, Trash2, Eye, Reply, X, MessageSquare } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ContactMessage } from '../../types';

export const AdminMessages: React.FC = () => {
  const { messages, updateMessageStatusById, deleteMessageById } = usePortfolio();

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read' | 'replied' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages.filter(msg => {
    const matchesFilter =
      activeFilter === 'all' || msg.status === activeFilter;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.company?.toLowerCase().includes(query) ||
      msg.subject.toLowerCase().includes(query);

    return matchesFilter && matchesQuery;
  });

  const getStatusBadge = (status: ContactMessage['status']) => {
    switch (status) {
      case 'unread':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase">Não Lida</span>;
      case 'read':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase">Lida</span>;
      case 'replied':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase">Respondida</span>;
      case 'archived':
        return <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-bold text-[10px] uppercase">Arquivada</span>;
    }
  };

  const handleOpenMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      updateMessageStatusById(msg.id, 'read');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Mensagens & Contatos</h2>
          <p className="text-xs text-zinc-500">Caixa de entrada de mensagens do formulário de contato</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-500">Total: {messages.length}</span>
          <span className="text-xs font-bold text-amber-500">({messages.filter(m => m.status === 'unread').length} não lidas)</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'unread', label: 'Não Lidas' },
            { id: 'read', label: 'Lidas' },
            { id: 'replied', label: 'Respondidas' },
            { id: 'archived', label: 'Arquivadas' },
          ].map(tab => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por remetente, e-mail..."
            className="w-full pl-11 pr-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

      </div>

      {/* Messages Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-4 px-6">Remetente / Empresa</th>
                <th className="py-4 px-4">E-mail / Telefone</th>
                <th className="py-4 px-4">Assunto</th>
                <th className="py-4 px-4">Data</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-medium">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 italic">
                    Nenhuma mensagem encontrada nesta pasta.
                  </td>
                </tr>
              ) : (
                filteredMessages.map(msg => (
                  <tr
                    key={msg.id}
                    className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer ${
                      msg.status === 'unread' ? 'bg-amber-500/5 font-bold' : ''
                    }`}
                    onClick={() => handleOpenMessage(msg)}
                  >
                    <td className="py-3.5 px-6">
                      <div>
                        <p className="text-zinc-900 dark:text-zinc-100 font-bold">{msg.name}</p>
                        <p className="text-[10px] text-zinc-400">{msg.company || '—'}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                      <p>{msg.email}</p>
                      {msg.phone && <p className="text-[10px] text-zinc-400">{msg.phone}</p>}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-800 dark:text-zinc-200 max-w-xs truncate">
                      {msg.subject || 'Contato'}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(msg.status)}
                    </td>

                    <td className="py-3.5 px-6 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenMessage(msg)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-600 hover:text-white"
                          title="Ler Mensagem"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => updateMessageStatusById(msg.id, msg.status === 'unread' ? 'read' : 'unread')}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-500 hover:text-white"
                          title="Alternar Lida / Não Lida"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => updateMessageStatusById(msg.id, 'archived')}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white"
                          title="Arquivar"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Excluir esta mensagem permanentemente?')) {
                              deleteMessageById(msg.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-red-500 hover:bg-red-600 hover:text-white"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Reader Drawer */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 my-8"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedMessage.status)}
                    <span className="text-[11px] text-zinc-400">
                      {new Date(selectedMessage.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {selectedMessage.subject || 'Contato'}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 rounded-full text-zinc-400 hover:text-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sender Details */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Remetente</p>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">{selectedMessage.name}</p>
                  {selectedMessage.company && <p className="text-zinc-500">{selectedMessage.company}</p>}
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Contatos</p>
                  <p className="text-blue-500 font-semibold">{selectedMessage.email}</p>
                  {selectedMessage.phone && <p className="text-zinc-500">{selectedMessage.phone}</p>}
                </div>
              </div>

              {/* Message Content Body */}
              <div className="space-y-2">
                <p className="text-xs uppercase font-bold text-zinc-400">Conteúdo da Mensagem</p>
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  onClick={() => updateMessageStatusById(selectedMessage.id, 'replied')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  <Reply className="w-4 h-4" />
                  <span>Responder via E-mail</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updateMessageStatusById(selectedMessage.id, 'archived');
                      setSelectedMessage(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase"
                  >
                    Arquivar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Excluir mensagem?')) {
                        deleteMessageById(selectedMessage.id);
                        setSelectedMessage(null);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600/10 text-red-500 font-bold text-xs uppercase"
                  >
                    Excluir
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
