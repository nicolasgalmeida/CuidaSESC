
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  PlusCircle, 
  LogOut, 
  X,
  BarChart3,
  Stethoscope,
  MessageSquareShare
} from 'lucide-react';
import { AppView, UserRole } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
  userName: string;
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout, userName, userRole, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Painel Central', icon: LayoutDashboard },
    { id: 'patients', label: 'Prontuários', icon: ClipboardList },
    { id: 'new-record', label: 'Novo Registro', icon: PlusCircle },
    { id: 'handover', label: 'Passagem de Turno', icon: MessageSquareShare },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    ...(userRole === 'Gestor' ? [{ id: 'users', label: 'Gestão Equipe', icon: Users }] : []),
  ];

  const handleNavClick = (view: AppView) => {
    setView(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-72 bg-[#0c1a32] text-white flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                 <Stethoscope className="text-white" size={24} />
               </div>
               <div>
                 <h1 className="text-xl font-black tracking-tight leading-none uppercase">CuidaSESC</h1>
                 <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-1">Ambulatório Digital</p>
               </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded-md">
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scroll">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as AppView)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-[#0a1529]">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-black border border-white/20 uppercase shadow-lg">
              {userName.substring(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-sm font-black truncate">{userName}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{userRole}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
