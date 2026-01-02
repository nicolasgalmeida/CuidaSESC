
import React, { useState } from 'react';
import { ShiftNote } from '../types';
import { 
  Plus, 
  MessageSquareShare, 
  Bell, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Send, 
  Calendar, 
  X, 
  Edit2, 
  Share2, 
  Square,
  CheckSquare,
  ListChecks,
  Copy,
  LayoutGrid
} from 'lucide-react';

interface HandoverProps {
  notes: ShiftNote[];
  onAddNote: (note: Omit<ShiftNote, 'id' | 'createdAt' | 'author' | 'isResolved'>) => void;
  onUpdateNote: (id: string, updatedData: Partial<ShiftNote>) => void;
  onResolveNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
  currentUserName: string;
}

const Handover: React.FC<HandoverProps> = ({ notes, onAddNote, onUpdateNote, onResolveNote, onDeleteNote, currentUserName }) => {
  const [activeTab, setActiveTab] = useState<'ativos' | 'historico'>('ativos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'Turno' as 'Turno' | 'Lembrete',
    reminderAt: ''
  });

  const activeNotes = notes.filter(n => !n.isResolved);
  const resolvedNotes = notes.filter(n => n.isResolved);
  const displayedNotes = activeTab === 'ativos' ? activeNotes : resolvedNotes;

  const handleEdit = (note: ShiftNote) => {
    setEditingNoteId(note.id);
    setNewNote({
      content: note.content,
      type: note.type,
      reminderAt: note.reminderAt ? note.reminderAt.substring(0, 16) : ''
    });
    setShowAddForm(true);
  };

  const toggleSelectNote = (id: string) => {
    setSelectedNoteIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedNoteIds.length === displayedNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(displayedNotes.map(n => n.id));
    }
  };

  const handleBulkShareWhatsApp = () => {
    if (selectedNoteIds.length === 0) return;

    const selectedNotes = notes.filter(n => selectedNoteIds.includes(n.id));
    
    let text = `*SESC ES - RESUMO DE COMUNICAÇÃO DE EQUIPE*\n`;
    text += `📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    text += `📊 Itens Selecionados: ${selectedNotes.length}\n`;
    text += `----------------------------------\n\n`;

    selectedNotes.forEach((note, index) => {
      const emoji = note.type === 'Turno' ? '🔄' : '🔔';
      const deadline = note.reminderAt ? ` [Prazo: ${new Date(note.reminderAt).toLocaleString('pt-BR')}]` : '';
      text += `${index + 1}. ${emoji} *${note.type.toUpperCase()}* | ${note.content}${deadline} (Por: ${note.author})\n\n`;
    });

    text += `----------------------------------\n`;
    text += `_Gerado via CuidaSESC Digital_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSingleShareWhatsApp = (note: ShiftNote) => {
    const emoji = note.type === 'Turno' ? '🔄' : '🔔';
    const deadline = note.reminderAt ? `\n⏰ *PRAZO:* ${new Date(note.reminderAt).toLocaleString('pt-BR')}` : '';
    
    const text = `*SESC ES - COMUNICAÇÃO DE EQUIPE*\n` +
                 `----------------------------------\n` +
                 `${emoji} *TIPO:* ${note.type.toUpperCase()}\n` +
                 `📝 *ASSUNTO:* ${note.content}\n` +
                 `👤 *AUTOR:* ${note.author}${deadline}\n` +
                 `----------------------------------\n` +
                 `_Gerado via CuidaSESC Digital_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;

    if (editingNoteId) {
      onUpdateNote(editingNoteId, {
        content: newNote.content,
        type: newNote.type,
        reminderAt: newNote.reminderAt || undefined
      });
    } else {
      onAddNote({
        content: newNote.content,
        type: newNote.type,
        reminderAt: newNote.reminderAt || undefined
      });
    }
    
    closeForm();
  };

  const closeForm = () => {
    setNewNote({ content: '', type: 'Turno', reminderAt: '' });
    setEditingNoteId(null);
    setShowAddForm(false);
  };

  const isAlarmDue = (dateStr?: string) => {
    if (!dateStr) return false;
    const now = new Date();
    const reminder = new Date(dateStr);
    return now >= reminder;
  };

  return (
    <div className="space-y-8 animate-fadeIn w-full max-w-[1400px] mx-auto pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Fluxo de Equipe</h2>
          <p className="text-slate-500 font-medium italic">Gerencie e compartilhe informações críticas em tempo real.</p>
        </div>
        <div className="flex gap-3">
           {displayedNotes.length > 0 && (
             <button 
                onClick={selectAll}
                className={`flex items-center justify-center gap-3 px-6 py-4 rounded-[24px] font-black transition-all border-2 ${
                  selectedNoteIds.length === displayedNotes.length 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <ListChecks size={20} /> 
                {selectedNoteIds.length === displayedNotes.length ? 'Desmarcar Todos' : 'Selecionar Tudo'}
              </button>
           )}
           <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={20} /> Nova Mensagem
            </button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Bell size={24} /></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alarmes Ativos</p><h4 className="text-2xl font-black text-slate-900">{activeNotes.filter(n => n.reminderAt).length}</h4></div>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><MessageSquareShare size={24} /></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aguardando Leitura</p><h4 className="text-2xl font-black text-slate-900">{activeNotes.length}</h4></div>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 size={24} /></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finalizados</p><h4 className="text-2xl font-black text-slate-900">{resolvedNotes.length}</h4></div>
         </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button onClick={() => {setActiveTab('ativos'); setSelectedNoteIds([]);}} className={`pb-4 px-4 text-sm font-black transition-all border-b-2 tracking-widest uppercase ${activeTab === 'ativos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>Fluxo Ativo</button>
        <button onClick={() => {setActiveTab('historico'); setSelectedNoteIds([]);}} className={`pb-4 px-4 text-sm font-black transition-all border-b-2 tracking-widest uppercase ${activeTab === 'historico' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>Histórico</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedNotes.map((note) => {
          const alarmTriggered = isAlarmDue(note.reminderAt) && !note.isResolved;
          const isSelected = selectedNoteIds.includes(note.id);
          
          return (
            <div 
              key={note.id} 
              onClick={() => toggleSelectNote(note.id)}
              className={`bg-white p-8 rounded-[40px] shadow-sm border relative group transition-all duration-500 cursor-pointer ${
                isSelected ? 'border-blue-500 ring-4 ring-blue-50 bg-blue-50/20' : 
                alarmTriggered ? 'border-amber-300 ring-4 ring-amber-50 critical-pulse' : 'border-slate-100'
              } ${note.isResolved ? 'opacity-70 grayscale-[0.2]' : ''}`}
            >
              
              {/* Checkbox de Seleção Multipla */}
              <div className={`absolute top-6 right-6 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-200 border border-slate-100'}`}>
                 {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              </div>

              {/* Checklist Toggle (Concluir Tarefa) */}
              <button 
                onClick={(e) => { e.stopPropagation(); onResolveNote(note.id); }}
                className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full flex items-center justify-center shadow-lg transition-all border-2 font-black text-[10px] uppercase tracking-widest ${
                  note.isResolved 
                  ? 'bg-emerald-500 border-white text-white' 
                  : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-500 hover:text-emerald-500'
                }`}
              >
                {note.isResolved ? '✓ Concluído' : 'Marcar como Lido'}
              </button>

              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${note.type === 'Turno' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  {note.type}
                </span>
                <div className="flex items-center gap-1 text-slate-300 mr-8">
                  <Clock size={12} />
                  <span className="text-[10px] font-bold">{new Date(note.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>

              <p className={`text-slate-700 font-medium leading-relaxed mb-8 min-h-[80px] ${note.isResolved ? 'line-through decoration-slate-300' : ''}`}>
                {note.content}
              </p>

              {note.reminderAt && !note.isResolved && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${alarmTriggered ? 'bg-amber-100 text-amber-700 font-black' : 'bg-slate-50 text-slate-500'}`}>
                   <Bell size={16} className={alarmTriggered ? 'animate-bounce' : ''} />
                   <span className="text-[9px] uppercase tracking-widest leading-none">
                     {alarmTriggered ? 'CRÍTICO: ' : 'ALERTA EM: '} {new Date(note.reminderAt).toLocaleString('pt-BR')}
                   </span>
                </div>
              )}

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                   <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">{note.author.substring(0, 2)}</div>
                   <span className="text-xs font-bold text-slate-900 truncate max-w-[80px]">{note.author.split(' ')[0]}</span>
                </div>
                
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleSingleShareWhatsApp(note)} className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm" title="Compartilhar Individual"><Share2 size={16} /></button>
                  <button onClick={() => handleEdit(note)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm" title="Editar"><Edit2 size={16} /></button>
                  <button onClick={() => onDeleteNote(note.id)} className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" title="Excluir"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          );
        })}

        {displayedNotes.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-slate-300">
            <LayoutGrid size={64} className="mb-4 opacity-20" /><p className="font-black uppercase tracking-widest text-center">Tudo limpo no fluxo {activeTab}</p>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedNoteIds.length > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-6 animate-slideUp">
           <div className="bg-[#0c1a32] p-6 rounded-[32px] shadow-2xl shadow-blue-900/40 border border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                    {selectedNoteIds.length}
                 </div>
                 <div>
                    <h4 className="font-black text-sm uppercase tracking-widest">Mensagens Selecionadas</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Pronto para compartilhamento em massa</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button 
                    onClick={() => setSelectedNoteIds([])}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Cancelar
                 </button>
                 <button 
                    onClick={handleBulkShareWhatsApp}
                    className="px-8 py-3 bg-[#25D366] text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-lg hover:scale-105 transition-all"
                  >
                    <Share2 size={18} /> Enviar p/ WhatsApp
                 </button>
              </div>
           </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden animate-slideUp">
             <div className="bg-[#0c1a32] p-8 flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-2xl"><Send size={24} /></div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none">{editingNoteId ? 'Editar Mensagem' : 'Nova Mensagem'}</h3>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Checklist • Comunicação de Plantão</p>
                  </div>
                </div>
                <button onClick={closeForm} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Categoria</label>
                  <div className="flex gap-3">
                    {['Turno', 'Lembrete'].map(t => (
                      <button key={t} type="button" onClick={() => setNewNote({...newNote, type: t as any})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${newNote.type === t ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Conteúdo da Mensagem</label>
                  <textarea required rows={4} className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[32px] focus:ring-4 focus:ring-blue-50 outline-none resize-none text-slate-700 font-medium" placeholder="Digite as informações aqui..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2"><Bell size={12} /> Prazo / Alerta de Horário (Opcional)</label>
                   <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="datetime-local" className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[20px] outline-none focus:ring-4 focus:ring-blue-50 text-slate-600 font-bold text-sm" value={newNote.reminderAt} onChange={e => setNewNote({...newNote, reminderAt: e.target.value})} />
                   </div>
                </div>
                <div className="pt-8 flex gap-4">
                  <button type="button" onClick={closeForm} className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-[24px] uppercase tracking-widest text-[10px]">Cancelar</button>
                  <button type="submit" className="flex-[2] py-5 bg-blue-600 text-white font-black rounded-[24px] uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all">{editingNoteId ? 'Salvar Alterações' : 'Publicar no Fluxo'}</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Handover;
