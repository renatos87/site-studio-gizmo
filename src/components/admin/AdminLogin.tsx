import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Key } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, setActiveSection } = usePortfolio();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const success = await loginAdmin(email, password);
    setIsSubmitting(false);

    if (success) {
      setActiveSection('admin');
    } else {
      setErrorMessage('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  const handleUseDemo = () => {
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 sm:p-6 text-[#f9f9f9] relative font-sans">
      
      {/* Background Accent */}
      <div className="absolute w-[500px] h-[500px] bg-[#c5a47e]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Public Site Button */}
      <button
        onClick={() => setActiveSection('home')}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/50 hover:text-[#c5a47e] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-[#c5a47e]" />
        <span>Voltar ao Portfólio</span>
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#c5a47e] text-[#050505] flex items-center justify-center mx-auto shadow-lg shadow-[#c5a47e]/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif text-[#f9f9f9]">Painel Administrativo</h1>
          <p className="text-xs text-white/50 font-sans">Autenticação segura para gerenciamento do portfólio</p>
        </div>

        {/* Demo Credentials Alert */}
        {/* <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#c5a47e]">
            <Key className="w-4 h-4" />
            <span>Acesso de Teste Demonstrativo</span>
          </div>
          <p className="text-white/70">
            <strong>E-mail:</strong> admin@portfolio.com <br />
            <strong>Senha:</strong> admin123
          </p>
          <button
            type="button"
            onClick={handleUseDemo}
            className="text-[11px] font-bold text-[#c5a47e] underline hover:text-[#b3926c]"
          >
            Preencher credenciais automáticas
          </button>
        </div> */}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-xs text-red-300 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e]">
              E-mail Administrativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c5a47e]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-[#c5a47e]">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#c5a47e]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#c5a47e] hover:bg-[#b3926c] text-[#050505] font-bold text-xs uppercase tracking-[0.15em] shadow-lg shadow-[#c5a47e]/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>

      </motion.div>
    </div>
  );
};
