import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Eye, Star, ArrowUp, ArrowDown, Upload, Image, X, Check, FileText, Link, Play, Sparkles } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Category, Project, ProjectImage } from '../../types';

interface AdminProjectsProps {
  openCreateModalDirectly?: boolean;
  onModalClosed?: () => void;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({
  openCreateModalDirectly = false,
  onModalClosed,
}) => {
  const { projects, clients, saveProject, deleteProjectById, reorderProjectsList, uploadImageFile } = usePortfolio();

  const [modalOpen, setModalOpen] = useState(openCreateModalDirectly);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'text' | 'media' | 'tags'>('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Todos');

  const categories: Category[] = [
    'Branding',
    'Identidade Visual',
    'Direção de Arte',
    'Design Gráfico',
    'Social Media',
    'Campanhas',
    'Motion Design',
    'Marketing',
    'Tecnologia',
    'Inteligência Artificial',
    'Web Design',
  ];

  // Initial blank project form
  const blankProject: Partial<Project> = {
    title: '',
    slug: '',
    clientId: '',
    clientName: '',
    category: 'Branding',
    year: new Date().getFullYear().toString(),
    description: '',
    objective: '',
    solution: '',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    galleryImages: [],
    videoUrl: '',
    externalUrl: '',
    tags: ['Branding', 'Design'],
    sortOrder: projects.length + 1,
    status: 'published',
    featured: false,
  };

  const handleOpenCreate = () => {
    setEditingProject({ ...blankProject, sortOrder: projects.length + 1 });
    setActiveTab('info');
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject({ ...proj });
    setActiveTab('info');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    if (onModalClosed) onModalClosed();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title) return;

    // Auto slug if empty
    const slug =
      editingProject.slug ||
      editingProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    await saveProject({
      ...editingProject,
      slug,
    });

    handleCloseModal();
  };

  // Drag & File Upload for Cover
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const uploadedUrl = await uploadImageFile(base64);
      setEditingProject(prev => prev ? { ...prev, coverImage: uploadedUrl } : null);
    };
    reader.readAsDataURL(file);
  };

  // Add Gallery Image
  const handleAddGalleryImage = (url: string, caption?: string) => {
    if (!editingProject) return;
    const newImg: ProjectImage = {
      id: 'img-' + Date.now(),
      url,
      caption: caption || '',
      sortOrder: (editingProject.galleryImages?.length || 0) + 1,
    };
    setEditingProject({
      ...editingProject,
      galleryImages: [...(editingProject.galleryImages || []), newImg],
    });
  };

  const handleRemoveGalleryImage = (id: string) => {
    if (!editingProject) return;
    setEditingProject({
      ...editingProject,
      galleryImages: editingProject.galleryImages?.filter(g => g.id !== id) || [],
    });
  };

  // Reordering move up / down
  const handleMoveProject = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newArr = [...projects];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    await reorderProjectsList(newArr.map(p => p.id));
  };

  const filteredProjects = projects.filter(p => {
    const matchesCat = filterCategory === 'Todos' || p.category === filterCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.clientName?.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Gerenciar Trabalhos</h2>
          <p className="text-xs text-zinc-500">Crie, edite, ordene e publique projetos no portfólio</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Trabalho</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar projetos..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Todos">Todas as Categorias</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Projects Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-4 px-4 w-12 text-center">Ordem</th>
                <th className="py-4 px-6">Projeto</th>
                <th className="py-4 px-4">Cliente</th>
                <th className="py-4 px-4">Categoria</th>
                <th className="py-4 px-4">Ano</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Destaque</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-medium">
              {filteredProjects.map((proj, idx) => (
                <tr key={proj.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors">
                  
                  {/* Move Controls */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleMoveProject(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-zinc-400 hover:text-blue-500 disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveProject(idx, 'down')}
                        disabled={idx === projects.length - 1}
                        className="p-1 rounded text-zinc-400 hover:text-blue-500 disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Title & Cover */}
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-0.5">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{proj.title}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">/trabalhos/{proj.slug}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">{proj.clientName || '—'}</td>
                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-semibold">{proj.category}</td>
                  <td className="py-3 px-4 text-zinc-500">{proj.year}</td>

                  {/* Status Toggle Badge */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        saveProject({
                          ...proj,
                          status: proj.status === 'published' ? 'draft' : 'published',
                        })
                      }
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        proj.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {proj.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </button>
                  </td>

                  {/* Featured Toggle */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() =>
                        saveProject({
                          ...proj,
                          featured: !proj.featured,
                        })
                      }
                      className={`p-2 rounded-full transition-colors ${
                        proj.featured
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                      }`}
                      title={proj.featured ? 'Remover destaque' : 'Destacar na Home'}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(proj)}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-600 hover:text-white transition-colors"
                        title="Editar Trabalho"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir "${proj.title}"?`)) {
                            deleteProjectById(proj.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-red-500 hover:bg-red-600 hover:text-white transition-colors"
                        title="Excluir Trabalho"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Form */}
      <AnimatePresence>
        {modalOpen && editingProject && (
          <div className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {editingProject.id ? 'Editar Trabalho' : 'Novo Trabalho'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                {[
                  { id: 'info', label: '1. Informações Básicas', icon: FileText },
                  { id: 'text', label: '2. Descrição & Solução', icon: Sparkles },
                  { id: 'media', label: '3. Mídias & Galeria', icon: Image },
                  { id: 'tags', label: '4. Tags & Links', icon: Link },
                ].map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* TAB 1: INFO */}
                {activeTab === 'info' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          Título do Projeto *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProject.title || ''}
                          onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                          placeholder="Ex: Aetheria AI Brand System"
                          className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          Slug de URL (opcional)
                        </label>
                        <input
                          type="text"
                          value={editingProject.slug || ''}
                          onChange={e => setEditingProject({ ...editingProject, slug: e.target.value })}
                          placeholder="aetheria-ai-brand"
                          className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          Cliente Associado
                        </label>
                        <select
                          value={editingProject.clientId || ''}
                          onChange={e => {
                            const selectedCli = clients.find(c => c.id === e.target.value);
                            setEditingProject({
                              ...editingProject,
                              clientId: e.target.value,
                              clientName: selectedCli?.name || '',
                            });
                          }}
                          className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione um cliente...</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          Categoria Principal *
                        </label>
                        <select
                          value={editingProject.category || 'Branding'}
                          onChange={e => setEditingProject({ ...editingProject, category: e.target.value as Category })}
                          className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          Ano
                        </label>
                        <input
                          type="text"
                          value={editingProject.year || '2026'}
                          onChange={e => setEditingProject({ ...editingProject, year: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Status de Publicação</p>
                          <p className="text-[11px] text-zinc-500">Publicado ou Rascunho privado</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProject({ ...editingProject, status: editingProject.status === 'published' ? 'draft' : 'published' })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold ${
                            editingProject.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {editingProject.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Destaque na Página Inicial</p>
                          <p className="text-[11px] text-zinc-500">Exibe selo especial de destaque</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingProject({ ...editingProject, featured: !editingProject.featured })}
                          className={`p-2.5 rounded-xl ${
                            editingProject.featured ? 'bg-amber-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TEXT */}
                {activeTab === 'text' && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Descrição Curta
                      </label>
                      <textarea
                        rows={3}
                        value={editingProject.description || ''}
                        onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                        placeholder="Resumo do projeto exibido no card do portfólio..."
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Objetivo do Projeto
                      </label>
                      <textarea
                        rows={3}
                        value={editingProject.objective || ''}
                        onChange={e => setEditingProject({ ...editingProject, objective: e.target.value })}
                        placeholder="Qual problema o cliente precisava resolver?"
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Solução Desenvolvida
                      </label>
                      <textarea
                        rows={3}
                        value={editingProject.solution || ''}
                        onChange={e => setEditingProject({ ...editingProject, solution: e.target.value })}
                        placeholder="Como a estratégia de design e direção de arte resolveu a demanda..."
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: MEDIA & GALLERY */}
                {activeTab === 'media' && (
                  <div className="space-y-6">
                    {/* Cover Upload */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Imagem de Capa Principal
                      </label>

                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <img
                          src={editingProject.coverImage}
                          alt="Cover Preview"
                          className="w-32 h-20 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="text"
                            value={editingProject.coverImage || ''}
                            onChange={e => setEditingProject({ ...editingProject, coverImage: e.target.value })}
                            placeholder="https://sua-imagem.com/capa.jpg"
                            className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                          />
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Fazer Upload do Arquivo</span>
                            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Gallery Images */}
                    <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                          Galeria de Imagens Adicionais
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const url = prompt('Insira a URL da imagem da galeria:');
                            if (url) handleAddGalleryImage(url);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Imagem à Galeria</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {editingProject.galleryImages?.map(img => (
                          <div key={img.id} className="relative group aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                            <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(img.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Video URL */}
                    <div className="space-y-1.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Play className="w-4 h-4 text-red-500" />
                        <span>URL do Vídeo (YouTube / Vimeo Embed)</span>
                      </label>
                      <input
                        type="text"
                        value={editingProject.videoUrl || ''}
                        onChange={e => setEditingProject({ ...editingProject, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/embed/..."
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: TAGS & LINKS */}
                {activeTab === 'tags' && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Link Externo do Projeto
                      </label>
                      <input
                        type="text"
                        value={editingProject.externalUrl || ''}
                        onChange={e => setEditingProject({ ...editingProject, externalUrl: e.target.value })}
                        placeholder="https://site-do-cliente.com"
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Tags (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        value={editingProject.tags?.join(', ') || ''}
                        onChange={e =>
                          setEditingProject({
                            ...editingProject,
                            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                          })
                        }
                        placeholder="Branding, Motion, UI/UX, GenAI"
                        className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
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
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase shadow-md"
                  >
                    Salvar Projeto
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
