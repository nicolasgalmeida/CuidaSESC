
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Stethoscope } from 'lucide-react';
import { SystemUser } from '../types';

interface LoginProps {
  onLogin: (user: SystemUser) => void;
  members: SystemUser[];
}

const Login: React.FC<LoginProps> = ({ onLogin, members }) => {
  const [email, setEmail] = useState('admin@sesc.com.br');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const user = members.find(m => m.email === email && m.password === password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Credenciais inválidas. Verifique seu email e senha.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[600px] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Visual */}
        <div className="hidden md:flex flex-1 bg-[#004a8e] relative p-12 text-white flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 blur-[120px] rounded-full" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl">
                <Stethoscope className="text-[#004a8e]" size={32} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-none">SESC</h1>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Fecomércio ES Senac</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Gestão <br/> <span className="text-yellow-400 text-3xl">Ambulatorial Integrada</span>
            </h2>
            <p className="text-blue-100/70 text-lg">Prontuário digital moderno para unidades de saúde.</p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-blue-200/50 text-xs font-bold uppercase tracking-widest">
            <span>Segurança</span>
            <span className="w-1 h-1 bg-blue-300 rounded-full" />
            <span>Agilidade</span>
            <span className="w-1 h-1 bg-blue-300 rounded-full" />
            <span>Cuidado</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">Acesso Restrito</h3>
            <p className="text-slate-500">Entre com sua conta profissional para prosseguir.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Profissional</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004a8e] transition-colors" size={20} />
                <input
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#004a8e] outline-none transition-all"
                  placeholder="seu@email.com.br"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004a8e] transition-colors" size={20} />
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#004a8e] outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-[#004a8e] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#003a70] hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-400 text-sm">
            <p className="font-bold text-slate-900 mb-1">SESC / FECOMÉRCIO ES</p>
            Dificuldades no acesso? <a href="#" className="text-[#004a8e] font-bold hover:underline">Suporte TI</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
