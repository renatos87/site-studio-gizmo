import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Share2, Search, Palette, Save, Upload, CheckCircle2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SiteSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const { settings, saveSiteSettings, uploadImageFile } = usePortfolio();

  const [formSettings, setFormSettings] = useState<SiteSettings>(JSON.parse(JSON.stringify(settings)));
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'social' | 'seo' | 'appearance'>('personal');
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const uploadedUrl = await uploadImageFile(base64);
      setFormSettings(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          avatar: uploadedUrl,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await saveSiteSettings(formSettings);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Configurações do Site</h2>
          <p className="text-xs text-zinc-500">Edite dados pessoais, redes sociais, contatos e preferências de SEO sem alterar código</p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'personal', label: 'Informações Pessoais', icon: User },
          { id: 'contact', label: 'Contatos & Cidade', icon: Mail },
          { id: 'social', label: 'Redes Sociais', icon: Share2 },
          { id: 'seo', label: 'SEO & Compartilhamento', icon: Search },
          { id: 'appearance', label: 'Aparência & Logo', icon: Palette },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-colors ${
                active
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Area */}
      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
        
        {/* PERSONAL INFO */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h3 className="text-sm uppercase font-extrabold tracking-widest text-blue-500">
              Perfil do Profissional
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formSettings.personalInfo?.name || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      personalInfo: { ...formSettings.personalInfo, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Cargo / Título
                </label>
                <input
                  type="text"
                  value={formSettings.personalInfo?.role || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      personalInfo: { ...formSettings.personalInfo, role: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Foto de Perfil / Portrait
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={formSettings.personalInfo?.avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <input
                  type="text"
                  value={formSettings.personalInfo?.avatar || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      personalInfo: { ...formSettings.personalInfo, avatar: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
                <label className="cursor-pointer p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 shrink-0">
                  <Upload className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Frase de Posicionamento no Hero
              </label>
              <input
                type="text"
                value={formSettings.personalInfo?.heroTagline || ''}
                onChange={e =>
                  setFormSettings({
                    ...formSettings,
                    personalInfo: { ...formSettings.personalInfo, heroTagline: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Biografia Completa (Seção Sobre)
              </label>
              <textarea
                rows={4}
                value={formSettings.personalInfo?.bio || ''}
                onChange={e =>
                  setFormSettings({
                    ...formSettings,
                    personalInfo: { ...formSettings.personalInfo, bio: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* CONTACT INFO */}
        {activeTab === 'contact' && (
          <div className="space-y-5">
            <h3 className="text-sm uppercase font-extrabold tracking-widest text-blue-500">
              Canais de Contato Exibidos no Site
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  E-mail de Atendimento
                </label>
                <input
                  type="email"
                  value={formSettings.contactInfo?.email || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      contactInfo: { ...formSettings.contactInfo, email: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Telefone Exibido
                </label>
                <input
                  type="text"
                  value={formSettings.contactInfo?.phone || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      contactInfo: { ...formSettings.contactInfo, phone: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Número do WhatsApp (Apenas Números com DDD)
                </label>
                <input
                  type="text"
                  value={formSettings.contactInfo?.whatsapp || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      contactInfo: { ...formSettings.contactInfo, whatsapp: e.target.value },
                    })
                  }
                  placeholder="5511987654321"
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Localização / Cidade
                </label>
                <input
                  type="text"
                  value={formSettings.contactInfo?.location || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      contactInfo: { ...formSettings.contactInfo, location: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL LINKS */}
        {activeTab === 'social' && (
          <div className="space-y-5">
            <h3 className="text-sm uppercase font-extrabold tracking-widest text-blue-500">
              Links das Redes Sociais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Instagram URL
                </label>
                <input
                  type="text"
                  value={formSettings.socialLinks?.instagram || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      socialLinks: { ...formSettings.socialLinks, instagram: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={formSettings.socialLinks?.linkedin || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      socialLinks: { ...formSettings.socialLinks, linkedin: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Behance URL
                </label>
                <input
                  type="text"
                  value={formSettings.socialLinks?.behance || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      socialLinks: { ...formSettings.socialLinks, behance: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  GitHub URL
                </label>
                <input
                  type="text"
                  value={formSettings.socialLinks?.github || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      socialLinks: { ...formSettings.socialLinks, github: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <h3 className="text-sm uppercase font-extrabold tracking-widest text-blue-500">
              Otimização de SEO & Meta Tags
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Título da Página (Meta Title)
              </label>
              <input
                type="text"
                value={formSettings.seoSettings?.metaTitle || ''}
                onChange={e =>
                  setFormSettings({
                    ...formSettings,
                    seoSettings: { ...formSettings.seoSettings, metaTitle: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={formSettings.seoSettings?.metaDescription || ''}
                onChange={e =>
                  setFormSettings({
                    ...formSettings,
                    seoSettings: { ...formSettings.seoSettings, metaDescription: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Palavras-chave (Keywords)
              </label>
              <input
                type="text"
                value={formSettings.seoSettings?.keywords || ''}
                onChange={e =>
                  setFormSettings({
                    ...formSettings,
                    seoSettings: { ...formSettings.seoSettings, keywords: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>
          </div>
        )}

        {/* APPEARANCE */}
        {activeTab === 'appearance' && (
          <div className="space-y-5">
            <h3 className="text-sm uppercase font-extrabold tracking-widest text-blue-500">
              Aparência & Identidade
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Texto da Logo do Header
                </label>
                <input
                  type="text"
                  value={formSettings.appearance?.logoText || ''}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      appearance: { ...formSettings.appearance, logoText: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Modo de Tema Padrão
                </label>
                <select
                  value={formSettings.appearance?.defaultTheme || 'dark'}
                  onChange={e =>
                    setFormSettings({
                      ...formSettings,
                      appearance: { ...formSettings.appearance, defaultTheme: e.target.value as any },
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                >
                  <option value="dark">Modo Escuro (Dark)</option>
                  <option value="light">Modo Claro (Light)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-right">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg"
          >
            {isSaving ? 'Salvando...' : 'Salvar Todas as Configurações'}
          </button>
        </div>

      </form>
    </div>
  );
};
