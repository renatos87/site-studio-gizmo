import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Globe, Instagram, Upload, X, FolderKanban } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Client } from '../../types';

interface AdminClientsProps {
  openCreateModalDirectly?: boolean;
  onModalClosed?: () => void;
}

export const AdminClients: React.FC<AdminClientsProps> = ({
  openCreateModalDirectly = false,
  onModalClosed,
}) => {
  const { clients, projects, saveClient, deleteClientById, uploadImageFile } = usePortfolio();

  const [modalOpen, setModalOpen] = useState(openCreateModalDirectly);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const blankClient: Partial<Client> = {
    name: '',
    slug: '',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    segment: 'Tecnologia & Inovação',
    description: '',
    website: '',
    instagram: '',
    status: 'active',
    sortOrder: clients.length + 1,
  };

  const handleOpenCreate = () => {
    setEditingClient({ ...blankClient });
    setModalOpen(true);
  };

  const handleOpenEdit = (cli: Client) => {
    setEditingClient({ ...cli });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingClient(null);
    if (onModalClosed) onModalClosed();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient?.name) return;

    const slug =
      editingClient.slug ||
      editingClient.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    await saveClient({
      ...editingClient,
      slug,
    });

    handleCloseModal();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const uploadedUrl = await uploadImageFile(base64);
      setEditingClient(prev => prev ? { ...prev, logo: uploadedUrl } : null);
    };
    reader.readAsDataURL(file);
  };

  const filteredClients = clients.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.segment.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Gerenciar Clientes</h2>
          <p className="text-xs text-zinc-500">Cadastre e gerencie marcas e parceiros atendidos</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-96">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar marcas por nome ou segmento..."
          className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Clients Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-4 px-6">Cliente / Logo</th>
                <th className="py-4 px-4">Segmento</th>
                <th className="py-4 px-4">Website / Instagram</th>
                <th className="py-4 px-4 text-center">Trabalhos Associados</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-medium">
              {filteredClients.map(client => {
                const linkedCount = projects.filter(
                  p => p.clientId === client.id || p.clientName === client.name
                ).length;

                return (
                  <tr key={client.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                    
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1.5 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                          <img
                            src={client.logo}
                            alt={client.name}
                            className="max-w-full max-h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">{client.name}</p>
                          <p className="text-[10px] text-zinc-400 line-clamp-1">{client.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-semibold">{client.segment}</td>

                    <td className="py-3 px-4 text-zinc-500 space-y-0.5">
                      {client.website && (
                        <p className="flex items-center gap-1.5 text-blue-500 hover:underline">
                          <Globe className="w-3 h-3" />
                          <a href={client.website} target="_blank" rel="noreferrer">{client.website.replace('https://', '')}</a>
                        </p>
                      )}
                      {client.instagram && (
                        <p className="flex items-center gap-1.5 text-pink-500">
                          <Instagram className="w-3 h-3" />
                          <span>{client.instagram}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                        <FolderKanban className="w-3 h-3" />
                        <span>{linkedCount}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          saveClient({
                            ...client,
                            status: client.status === 'active' ? 'inactive' : 'active',
                          })
                        }
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          client.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {client.status === 'active' ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>

                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-600 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Excluir cliente "${client.name}"?`)) {
                              deleteClientById(client.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Client */}
      <AnimatePresence>
        {modalOpen && editingClient && (
          <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 my-8"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {editingClient.id ? 'Editar Cliente' : 'Novo Cliente'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 rounded-full text-zinc-400 hover:text-zinc-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Nome da Marca / Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClient.name || ''}
                    onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                    placeholder="Ex: Aetheria AI Labs"
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Segmento de Atuação
                    </label>
                    <input
                      type="text"
                      value={editingClient.segment || ''}
                      onChange={e => setEditingClient({ ...editingClient, segment: e.target.value })}
                      placeholder="Ex: Tecnologia / Luxo / Mídia"
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Status
                    </label>
                    <select
                      value={editingClient.status || 'active'}
                      onChange={e => setEditingClient({ ...editingClient, status: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="active">Ativo (Exibe na Home)</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Logo do Cliente
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700 shrink-0 flex items-center justify-center">
                      <img src={editingClient.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <input
                      type="text"
                      value={editingClient.logo || ''}
                      onChange={e => setEditingClient({ ...editingClient, logo: e.target.value })}
                      placeholder="https://sua-imagem.com/logo.png"
                      className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                    />
                    <label className="cursor-pointer p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 shrink-0">
                      <Upload className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Descrição Curta
                  </label>
                  <textarea
                    rows={2}
                    value={editingClient.description || ''}
                    onChange={e => setEditingClient({ ...editingClient, description: e.target.value })}
                    placeholder="Breve resumo da empresa..."
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Website
                    </label>
                    <input
                      type="text"
                      value={editingClient.website || ''}
                      onChange={e => setEditingClient({ ...editingClient, website: e.target.value })}
                      placeholder="https://empresa.com"
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={editingClient.instagram || ''}
                      onChange={e => setEditingClient({ ...editingClient, instagram: e.target.value })}
                      placeholder="@empresa"
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase shadow-md"
                  >
                    Salvar Cliente
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
