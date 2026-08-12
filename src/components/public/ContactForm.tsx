import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Mail, Phone, MapPin, MessageSquare, CheckCircle2, Instagram, Linkedin, Github, Youtube, ExternalLink } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const ContactForm: React.FC = () => {
  const { settings, submitContactForm } = usePortfolio();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const contact = settings.contactInfo || {};
  const social = settings.socialLinks || {};

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      errs.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Insira um e-mail válido';
    }
    if (!formData.message.trim()) errs.message = 'Mensagem é obrigatória';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await submitContactForm(formData);
    setIsSubmitting(false);

    if (result.success) {
      setSubmittedSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
      });
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-[#050505] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-16 space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">
            04 / Vamos Conversar
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#f9f9f9]">
            Tem um projeto em mente?
          </h2>
          <p className="text-xl sm:text-2xl font-serif italic text-white/80">
            Vamos transformar ideias em experiências memoráveis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Contact Details & Social Links */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a47e]/10 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-xl font-serif font-semibold text-[#f9f9f9] tracking-tight">Canais de Contato Direto</h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Disponível para novos projetos de Direção de Arte, Rebranding, Consultoria em Inteligência Artificial e Campanhas Digitais.
              </p>

              <div className="space-y-4 pt-2 text-xs font-medium font-sans">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#c5a47e]/40 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#c5a47e]/10 border border-[#c5a47e]/20 text-[#c5a47e] flex items-center justify-center shrink-0 group-hover:bg-[#c5a47e] group-hover:text-[#050505] transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#c5a47e] uppercase tracking-[0.15em] font-bold">E-mail</p>
                      <p className="text-[#f9f9f9] font-medium">{contact.email}</p>
                    </div>
                  </a>
                )}

                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#c5a47e]/40 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#c5a47e]/10 border border-[#c5a47e]/20 text-[#c5a47e] flex items-center justify-center shrink-0 group-hover:bg-[#c5a47e] group-hover:text-[#050505] transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#c5a47e] uppercase tracking-[0.15em] font-bold">Telefone / WhatsApp</p>
                      <p className="text-[#f9f9f9] font-medium">{contact.phone}</p>
                    </div>
                  </a>
                )}

                {contact.location && (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="w-9 h-9 rounded-xl bg-[#c5a47e]/10 border border-[#c5a47e]/20 text-[#c5a47e] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#c5a47e] uppercase tracking-[0.15em] font-bold">Localização</p>
                      <p className="text-[#f9f9f9] font-medium">{contact.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct WhatsApp CTA */}
              {contact.whatsapp && (
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%20Studio%20Gizmo!%20Vim%20pelo%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20falar%20sobre%20um%20projeto.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-[#c5a47e] hover:bg-[#b3926c] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] transition-colors shadow-lg shadow-[#c5a47e]/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Iniciar Conversa no WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            {/* Social Networks List */}
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#c5a47e]">
                Redes Sociais & Portfólios
              </h4>
              <div className="flex flex-wrap gap-2">
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-medium text-white/80 hover:text-[#c5a47e] hover:border-[#c5a47e]/40 transition-colors inline-flex items-center gap-2"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#c5a47e]" />
                    <span>Instagram</span>
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-medium text-white/80 hover:text-[#c5a47e] hover:border-[#c5a47e]/40 transition-colors inline-flex items-center gap-2"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-[#c5a47e]" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {social.behance && (
                  <a
                    href={social.behance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-medium text-white/80 hover:text-[#c5a47e] hover:border-[#c5a47e]/40 transition-colors inline-flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#c5a47e]" />
                    <span>Behance</span>
                  </a>
                )}
                {social.github && (
                  <a
                    href={social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-medium text-white/80 hover:text-[#c5a47e] hover:border-[#c5a47e]/40 transition-colors inline-flex items-center gap-2"
                  >
                    <Github className="w-3.5 h-3.5 text-[#c5a47e]" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 shadow-2xl">
            {submittedSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#c5a47e]/10 text-[#c5a47e] border border-[#c5a47e]/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif text-[#f9f9f9]">Mensagem Recebida!</h3>
                <p className="text-sm text-white/60 max-w-md mx-auto font-sans">
                  Obrigado pelo contato. Analisarei as informações do seu projeto e retornarei em até 24 horas úteis.
                </p>
                <button
                  onClick={() => setSubmittedSuccess(false)}
                  className="px-6 py-2.5 rounded-full bg-[#c5a47e] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#b3926c]"
                >
                  Enviar Outra Mensagem
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e]">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Ana Souza"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border ${
                        errors.name ? 'border-red-500' : 'border-white/10'
                      } text-xs text-[#f9f9f9] placeholder-white/30 focus:outline-none focus:border-[#c5a47e]`}
                    />
                    {errors.name && <p className="text-[11px] text-red-400 font-medium">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e]">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ana@empresa.com"
                      className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border ${
                        errors.email ? 'border-red-500' : 'border-white/10'
                      } text-xs text-[#f9f9f9] placeholder-white/30 focus:outline-none focus:border-[#c5a47e]`}
                    />
                    {errors.email && <p className="text-[11px] text-red-400 font-medium">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/60">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#f9f9f9] placeholder-white/30 focus:outline-none focus:border-[#c5a47e]"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/60">
                      Empresa / Marca
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nome da empresa"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#f9f9f9] placeholder-white/30 focus:outline-none focus:border-[#c5a47e]"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-white/60">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ex: Direção de arte para nova campanha"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#f9f9f9] placeholder-white/30 focus:outline-none focus:border-[#c5a47e]"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e]">
                    Sua Mensagem *
                  </label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Descreva brevemente o projeto, objetivos e prazos estimados..."
                    className={`w-full px-4 py-3 rounded-xl bg-white/[0.03] border ${
                      errors.message ? 'border-red-500' : 'border-white/10'
                    } text-xs text-[#f9f9f9] placeholder-white/30 focus:outline-none focus:border-[#c5a47e] resize-none`}
                  />
                  {errors.message && <p className="text-[11px] text-red-400 font-medium">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-[#c5a47e] hover:bg-[#b3926c] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-xl shadow-[#c5a47e]/20 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
