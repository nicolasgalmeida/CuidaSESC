
import React, { useState } from 'react';
import { SystemUser, UserRole } from '../types';
import { UserPlus, Edit2, Trash2, Phone, Shield, Search, X, Check, Mail, Key } from 'lucide-react';

interface TeamManagementProps {
  members: SystemUser[];
  setMembers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ members, setMembers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<SystemUser | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Técnico Enfermagem' as UserRole,
    coren: '',
    email: '',
    password: ''
  });

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.coren.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (member?: SystemUser) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        phone: member.phone,
        role: member.role,
        coren: member.coren,
        email: member.email,
        password: member.password || ''
      });
    } else {
      setEditingMember(null);
      setFormData({ name: '', phone: '', role: 'Técnico Enfermagem', coren: '', email: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...formData } : m));
    } else {
      const newUser: SystemUser = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      setMembers(prev => [...prev, newUser]);
    }
    setIsModalOpen(false);
  };

  const removeMember = (id: string) => {
    if (confirm('Deseja realmente remover este membro da equipe?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestão de Equipe</h2>
          <p className="text-slate-500 mt-1">Gerencie os acessos e credenciais dos profissionais de saúde.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
        >
          <UserPlus size={20} /> Adicionar Profissional
        </button>
      </header>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Buscar por nome, email ou COREN..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Profissional</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Credenciais</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Cargo / COREN</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 uppercase">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{member.name}</p>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                         <Phone size={12} /> {member.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                      <Mail size={14} className="text-slate-400" /> {member.email}
                    </p>
                    <p className="text-slate-400 text-xs font-mono">
                      <span className="opacity-40">Senha:</span> ••••••••
                    </p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase mb-1 ${member.role === 'Gestor' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {member.role}
                  </span>
                  <p className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Shield size={14} className="text-slate-400" /> {member.coren}
                  </p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openModal(member)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => removeMember(member.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-scaleIn">
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold">{editingMember ? 'Editar Profissional' : 'Novo Profissional'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto max-h-[80vh]">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Nome Completo</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Cargo</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value="Técnico Enfermagem">Técnico Enfermagem</option>
                    <option value="Gestor">Gestor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">COREN</label>
                  <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" 
                    placeholder="Ex: COREN-SP 000.000"
                    value={formData.coren} onChange={e => setFormData({...formData, coren: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Telefone</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-700">Acesso ao Sistema</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Email (Login)</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="email" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" 
                      placeholder="email@sesc.com.br"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Senha</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="password" title="Mínimo 6 caracteres" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" 
                      placeholder="••••••••"
                      value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 px-6 bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"><Check size={18} /> {editingMember ? 'Atualizar Dados' : 'Criar Profissional'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
