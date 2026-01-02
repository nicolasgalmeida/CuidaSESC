
import React, { useState, useEffect, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientForm from './components/PatientForm';
import TeamManagement from './components/TeamManagement';
import Reports from './components/Reports';
import Handover from './components/Handover';
import { AppView, MedicalRecord, SeverityLevel, SystemUser, ShiftNote } from './types';
import { X, Menu, User, Clipboard, Share2, FileDown, Camera, Stethoscope, Activity, MapPin, AlertCircle, CheckCircle2, Loader2, ListChecks, Sparkles, Phone, Shield, Bell, Volume2, VolumeX, Clock, BellOff, Image as ImageIcon, ZoomIn, AlertTriangle, Navigation, Heart, FileText, Info } from 'lucide-react';
import { generateProfessionalReport } from './services/geminiService';

const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: '1',
    patientName: 'Antônio Ferreira',
    age: 45,
    gender: 'Masculino',
    phone: '(27) 98888-7777',
    patientType: 'Funcionário',
    area: 'Parques',
    subLocation: 'Trilha Ecológica',
    natureOfOccurrence: 'Cortes',
    reason: 'Uso inadequado',
    severity: SeverityLevel.MEDIUM,
    description: 'Pequeno corte no antebraço direito causado por aresta metálica em equipamento de trilha.',
    procedures: ['Limpeza', 'Curativo de ferimentos superficiais', 'Orientação ao paciente'],
    detailedConduct: 'Realizada assepsia com soro fisiológico e PVPI degermante. Aplicado curativo oclusivo com gaze estéril e fita microporosa. Paciente orientado sobre sinais de infecção.',
    vitalSigns: { fc: '82', pa: '12/8', temp: '36.6', sato2: '98' },
    allergies: { medication: 'Dipirona', food: 'Nenhuma', others: 'Nenhuma' },
    destination: 'Retornou ao Lazer/Parque',
    status: 'Fechado',
    responsibleTech: 'Dr. Ricardo Oliveira',
    occurrenceAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'Dr. Ricardo Oliveira',
    photoUrls: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800']
  }
];

const INITIAL_USERS: SystemUser[] = [
  { id: '1', name: 'Dr. Ricardo Oliveira', phone: '(27) 99999-8888', role: 'Gestor', coren: 'COREN-ES 123.456', email: 'admin@sesc.com.br', password: 'password123' },
  { id: '2', name: 'Enf. Juliana Santos', phone: '(27) 98888-7777', role: 'Técnico Enfermagem', coren: 'COREN-ES 654.321', email: 'tecnico@sesc.com.br', password: '123' }
];

const INITIAL_NOTES: ShiftNote[] = [
  { id: 'n1', content: 'Reabastecer gazes e esparadrapos no kit de primeiros socorros da Trilha.', type: 'Lembrete', author: 'Enf. Juliana Santos', createdAt: new Date().toISOString(), isResolved: false, reminderAt: new Date(Date.now() + 3600000).toISOString(), alarmPlayed: false },
  { id: 'n2', content: 'Passagem de turno: 15 atendimentos realizados, todos casos leves.', type: 'Turno', author: 'Dr. Ricardo Oliveira', createdAt: new Date(Date.now() - 43200000).toISOString(), isResolved: true, alarmPlayed: true }
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('login');
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>(INITIAL_RECORDS);
  const [teamMembers, setTeamMembers] = useState<SystemUser[]>(INITIAL_USERS);
  const [shiftNotes, setShiftNotes] = useState<ShiftNote[]>(INITIAL_NOTES);
  const [selectedRecordDetails, setSelectedRecordDetails] = useState<MedicalRecord | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<MedicalRecord | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stopAlarmSound = useCallback(() => {
    if (alarmIntervalRef.current) {
      window.clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    setIsAlarmRinging(false);
  }, []);

  const startAlarmSound = useCallback(() => {
    if (isMuted || isAlarmRinging) return;
    setIsAlarmRinging(true);
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    const playBeep = () => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    };
    alarmIntervalRef.current = window.setInterval(() => playBeep(), 1000);
  }, [isMuted, isAlarmRinging]);

  const handleSilenceAlarm = () => {
    stopAlarmSound();
    const now = new Date();
    setShiftNotes(prev => prev.map(n => 
      (!n.isResolved && n.reminderAt && now >= new Date(n.reminderAt)) 
      ? { ...n, alarmPlayed: true } 
      : n
    ));
  };

  const [dueAlarmsCount, setDueAlarmsCount] = useState(0);

  useEffect(() => {
    const monitor = setInterval(() => {
      const now = new Date();
      const newActiveAlarms = shiftNotes.filter(n => !n.isResolved && n.reminderAt && now >= new Date(n.reminderAt) && !n.alarmPlayed);
      if (newActiveAlarms.length > 0 && !isAlarmRinging) startAlarmSound();
      const totalDue = shiftNotes.filter(n => !n.isResolved && n.reminderAt && now >= new Date(n.reminderAt)).length;
      setDueAlarmsCount(totalDue);
    }, 2000);
    return () => clearInterval(monitor);
  }, [shiftNotes, startAlarmSound, isAlarmRinging]);

  const handleLogin = (user: SystemUser) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    stopAlarmSound();
  };

  const addShiftNote = (noteData: Omit<ShiftNote, 'id' | 'createdAt' | 'author' | 'isResolved'>) => {
    const newNote: ShiftNote = {
      id: Math.random().toString(36).substr(2, 9),
      ...noteData,
      author: currentUser?.name || 'Sistema',
      createdAt: new Date().toISOString(),
      isResolved: false,
      alarmPlayed: false
    };
    setShiftNotes(prev => [newNote, ...prev]);
  };

  const updateShiftNote = (id: string, updatedData: Partial<ShiftNote>) => {
    setShiftNotes(prev => prev.map(n => n.id === id ? { ...n, ...updatedData, alarmPlayed: false } : n));
  };

  const resolveShiftNote = (id: string) => {
    setShiftNotes(prev => prev.map(n => n.id === id ? { ...n, isResolved: true } : n));
  };

  const deleteShiftNote = (id: string) => {
    if (confirm('Remover esta nota permanentemente?')) {
      setShiftNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const saveRecord = (data: Omit<MedicalRecord, 'id' | 'createdAt' | 'createdBy'>) => {
    if (recordToEdit) {
      setRecords(prev => prev.map(r => r.id === recordToEdit.id ? { ...r, ...data } : r));
      setRecordToEdit(null);
    } else {
      const newRecord: MedicalRecord = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'Desconhecido'
      };
      setRecords(prev => [...prev, newRecord]);
    }
    setView('patients');
  };

  const handleEditFromReport = (record: MedicalRecord) => {
    setRecordToEdit(record);
    setView('new-record');
  };

  const handleWhatsAppShare = (record: MedicalRecord) => {
    const shareText = `*SESC ESPÍRITO SANTO - PRONTUÁRIO DIGITAL*\n\n` +
      `*Paciente:* ${record.patientName} (${record.age} anos)\n` +
      `*Protocolo:* #${record.id.toUpperCase()}\n` +
      `*Gravidade:* ${record.severity}\n` +
      `*Responsável:* ${record.responsibleTech}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleExportPDF = async () => {
    if (!selectedRecordDetails) return;
    setIsGeneratingPDF(true);
    try {
      if (!selectedRecordDetails.report) {
        const reportText = await generateProfessionalReport(selectedRecordDetails);
        selectedRecordDetails.report = reportText;
        setRecords(prev => prev.map(r => r.id === selectedRecordDetails.id ? { ...r, report: reportText } : r));
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const sanitizedName = selectedRecordDetails.patientName.replace(/\s+/g, '_').toUpperCase();

      const page1 = document.getElementById('pdf-page-1');
      if (page1) {
        const canvas1 = await html2canvas(page1, { 
          scale: 2, 
          useCORS: true,
          logging: false
        });
        const imgData1 = canvas1.toDataURL('image/png');
        const imgProps1 = pdf.getImageProperties(imgData1);
        const pdfHeight1 = (imgProps1.height * pdfWidth) / imgProps1.width;
        pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, pdfHeight1);
      }

      if (selectedRecordDetails.photoUrls.length > 0) {
        pdf.addPage();
        const page2 = document.getElementById('pdf-page-2');
        if (page2) {
          const canvas2 = await html2canvas(page2, { 
            scale: 2, 
            useCORS: true,
            logging: false
          });
          const imgData2 = canvas2.toDataURL('image/png');
          const imgProps2 = pdf.getImageProperties(imgData2);
          const pdfHeight2 = (imgProps2.height * pdfWidth) / imgProps2.width;
          pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight2);
        }
      }

      pdf.save(`LAUDO_SESC_${sanitizedName}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (view === 'login') return <Login onLogin={handleLogin} members={teamMembers} />;

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans selection:bg-blue-100 selection:text-blue-900">
      <div id="web-layout" className="flex print:hidden min-h-screen overflow-x-hidden">
        <Sidebar 
          currentView={view} 
          setView={(v) => { if (v !== 'new-record') setRecordToEdit(null); setView(v); }} 
          onLogout={handleLogout} 
          userName={currentUser?.name || ''}
          userRole={currentUser?.role || 'Técnico Enfermagem'}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 lg:ml-72 min-h-screen flex flex-col w-full relative">
          <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors">
                <Menu size={24} />
              </button>
              <div className="flex items-center gap-3 bg-slate-100 px-5 py-2.5 rounded-[20px] border border-slate-200 shadow-inner">
                 <Clock size={18} className="text-slate-400" />
                 <span className="font-mono text-xl font-black text-slate-800 tracking-tighter">
                   {currentTime.toLocaleTimeString('pt-BR')}
                 </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
               {isAlarmRinging && (
                 <button onClick={handleSilenceAlarm} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl animate-pulse border-2 border-white">
                   <BellOff size={18} /> Parar Alarme
                 </button>
               )}
               <button onClick={() => setIsMuted(!isMuted)} className={`p-2.5 rounded-xl transition-all ${isMuted ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
               </button>
               {dueAlarmsCount > 0 && (
                 <div onClick={() => setView('handover')} className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl cursor-pointer hover:bg-amber-100 transition-all critical-pulse">
                   <Bell size={18} className={isAlarmRinging ? 'animate-bounce' : ''} />
                   <span className="text-xs font-black uppercase tracking-widest">{dueAlarmsCount} Alertas</span>
                 </div>
               )}
            </div>
          </div>
          
          <div className="flex-1 p-5 md:p-8 lg:p-12 w-full max-w-[1600px] mx-auto animate-fadeIn">
            {view === 'dashboard' && <Dashboard records={records} />}
            {view === 'patients' && <PatientList records={records} onViewDetails={(r) => setSelectedRecordDetails(r)} />}
            {view === 'new-record' && (
              <PatientForm currentUserName={currentUser?.name || ''} initialData={recordToEdit || undefined} onSave={saveRecord} onCancel={() => { setRecordToEdit(null); setView('dashboard'); }} />
            )}
            {view === 'users' && currentUser?.role === 'Gestor' && <TeamManagement members={teamMembers} setMembers={setTeamMembers} />}
            {view === 'reports' && <Reports records={records} onEditRecord={handleEditFromReport} />}
            {view === 'handover' && (
              <Handover notes={shiftNotes} onAddNote={addShiftNote} onUpdateNote={updateShiftNote} onResolveNote={resolveShiftNote} onDeleteNote={deleteShiftNote} currentUserName={currentUser?.name || ''} />
            )}
          </div>
        </main>
      </div>

      {selectedRecordDetails && (
        <div id="details-modal" className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-0 md:p-8 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-[1400px] rounded-none md:rounded-[48px] shadow-2xl flex flex-col animate-slideUp max-h-full md:max-h-[95vh] overflow-hidden border border-white/20">
            
            {/* Modal Header */}
            <div className="bg-[#0c1a32] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between text-white gap-8 shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none" />
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-20 h-20 bg-emerald-500 rounded-[24px] flex items-center justify-center shadow-2xl rotate-3 border-4 border-white/10">
                   <Stethoscope size={40} className="text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tight leading-none mb-3">Prontuário Digital</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-1 bg-white/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/5">SESC ESPÍRITO SANTO</span>
                    <span className="px-4 py-1 bg-red-500/20 text-red-300 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20">#{selectedRecordDetails.id.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedRecordDetails(null)} className="absolute top-8 right-8 p-4 hover:bg-white/10 rounded-full transition-all group active:scale-90"><X size={32} /></button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 bg-[#f8fafc] custom-scroll">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-10">
                  <section className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm"><User size={20} /></div>
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Identificação do Paciente</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="md:col-span-2">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Nome Completo</p>
                          <p className="text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">{selectedRecordDetails.patientName}</p>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Perfil / Idade</p>
                            <p className="text-sm font-black text-slate-700">{selectedRecordDetails.age} ANOS • {selectedRecordDetails.gender}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vínculo</p>
                            <p className="text-sm font-black text-emerald-600 uppercase">{selectedRecordDetails.patientType}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contato</p>
                            <p className="text-sm font-black text-slate-700">{selectedRecordDetails.phone || 'NÃO INFORMADO'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data/Hora Ocorrência</p>
                            <p className="text-sm font-black text-slate-700">{new Date(selectedRecordDetails.occurrenceAt).toLocaleString('pt-BR')}</p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                             <MapPin className="text-slate-400" size={20} />
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Localização</p>
                                <p className="text-sm font-bold text-slate-800">{selectedRecordDetails.area} • {selectedRecordDetails.subLocation}</p>
                             </div>
                          </div>
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4">
                             <Navigation className="text-amber-500" size={20} />
                             <div>
                                <p className="text-[10px] font-black text-amber-500 uppercase">Destino</p>
                                <p className="text-sm font-bold text-slate-800">{selectedRecordDetails.destination}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </section>

                  {/* Segurança */}
                  <section className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm"><AlertTriangle size={20} /></div>
                      <h4 className="text-xs font-black text-red-400 uppercase tracking-[0.3em]">Segurança & Alergias</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className={`p-5 rounded-2xl border-2 ${selectedRecordDetails.allergies.medication ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Medicamentosas</p>
                          <p className={`text-sm font-black ${selectedRecordDetails.allergies.medication ? 'text-red-600' : 'text-slate-500 italic'}`}>
                            {selectedRecordDetails.allergies.medication || 'NEGATIVO'}
                          </p>
                       </div>
                       <div className={`p-5 rounded-2xl border-2 ${selectedRecordDetails.allergies.food ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Alimentares</p>
                          <p className={`text-sm font-black ${selectedRecordDetails.allergies.food ? 'text-orange-600' : 'text-slate-500 italic'}`}>
                            {selectedRecordDetails.allergies.food || 'NEGATIVO'}
                          </p>
                       </div>
                       <div className={`p-5 rounded-2xl border-2 ${selectedRecordDetails.allergies.others ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Outras</p>
                          <p className={`text-sm font-black ${selectedRecordDetails.allergies.others ? 'text-blue-600' : 'text-slate-500 italic'}`}>
                            {selectedRecordDetails.allergies.others || 'NEGATIVO'}
                          </p>
                       </div>
                    </div>
                  </section>

                  {/* Descrição Técnica */}
                  <section className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm"><Clipboard size={20} /></div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Descrição Técnica</h4>
                      </div>
                      <div className="flex gap-3">
                         <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">{selectedRecordDetails.natureOfOccurrence}</span>
                         <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest">{selectedRecordDetails.reason}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-10">
                       <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Anamnese / Queixa</p>
                          <div className="p-8 bg-slate-900 text-slate-300 rounded-[32px] border-4 border-slate-800 shadow-inner italic text-lg leading-relaxed">
                            {selectedRecordDetails.description}
                          </div>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Cuidados Aplicados</p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {selectedRecordDetails.procedures.map((p, i) => (
                              <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-100 flex items-center gap-2"><CheckCircle2 size={12}/> {p}</span>
                            ))}
                          </div>
                          <div className="p-8 bg-emerald-50/20 rounded-[32px] border border-emerald-100 text-slate-700 leading-relaxed font-medium">
                            {selectedRecordDetails.detailedConduct}
                          </div>
                       </div>
                    </div>
                  </section>
                </div>
                
                {/* Right Column */}
                <div className="lg:col-span-4 space-y-10">
                   {/* Vitals */}
                   <div className="bg-[#0c1a32] p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[80px] -mr-24 -mt-24" />
                      <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3"><Activity size={18} /> Monitoramento</h5>
                      <div className="grid grid-cols-2 gap-5">
                        {[
                          { label: 'P.A', value: selectedRecordDetails.vitalSigns.pa, unit: 'mmHg' },
                          { label: 'F.C', value: selectedRecordDetails.vitalSigns.fc, unit: 'bpm' },
                          { label: 'TEMP', value: selectedRecordDetails.vitalSigns.temp, unit: '°C' },
                          { label: 'SatO2', value: selectedRecordDetails.vitalSigns.sato2, unit: '%' }
                        ].map((v, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[28px] backdrop-blur-sm transition-transform hover:scale-[1.05]">
                             <p className="text-[10px] font-black text-slate-500 uppercase mb-2">{v.label}</p>
                             <p className="text-3xl font-black text-white">{v.value}<span className="text-xs ml-1 text-slate-500">{v.unit}</span></p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-10 pt-10 border-t border-white/10">
                        <div className={`w-full py-5 rounded-[24px] flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.2em] shadow-xl ${
                          selectedRecordDetails.severity === SeverityLevel.CRITICAL ? 'bg-red-600 text-white' :
                          selectedRecordDetails.severity === SeverityLevel.HIGH ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                           <AlertCircle size={20} /> {selectedRecordDetails.severity}
                        </div>
                      </div>
                   </div>

                   {/* Gallery */}
                   <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between mb-8">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><ImageIcon size={18} className="text-blue-500" /> Galeria de Fotos</h5>
                        <span className="bg-slate-50 px-4 py-1.5 rounded-xl text-[10px] font-black text-slate-400 border border-slate-100">{selectedRecordDetails.photoUrls.length}</span>
                      </div>
                      {selectedRecordDetails.photoUrls.length > 0 ? (
                        <div className="space-y-6">
                          {selectedRecordDetails.photoUrls.map((url, i) => (
                            <div key={i} className="relative rounded-[32px] overflow-hidden group border border-slate-100 shadow-lg">
                               <img src={url} className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-110" />
                               <div className="absolute inset-0 bg-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ZoomIn size={48} className="text-white" />
                               </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-20 border-4 border-dashed border-slate-50 rounded-[40px] flex flex-col items-center justify-center text-slate-200 gap-4 grayscale opacity-40">
                           <ImageIcon size={64} />
                           <p className="text-xs font-black uppercase tracking-[0.3em]">Sem registros</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-10 md:p-12 bg-white border-t border-slate-100 flex flex-wrap justify-end gap-5 shrink-0">
               <button onClick={() => handleWhatsAppShare(selectedRecordDetails)} className="px-10 py-6 bg-[#25D366] text-white font-black rounded-[32px] flex items-center gap-4 text-sm shadow-2xl hover:scale-[1.02] transition-all"><Share2 size={24} /> WhatsApp</button>
               <button onClick={handleExportPDF} disabled={isGeneratingPDF} className="px-10 py-6 bg-[#0c1a32] text-white font-black rounded-[32px] flex items-center gap-4 text-sm shadow-2xl hover:bg-slate-900 transition-all disabled:opacity-70 group">
                 {isGeneratingPDF ? <Loader2 className="animate-spin" size={24} /> : <FileDown size={24} />}
                 {isGeneratingPDF ? 'GERANDO...' : 'Gerar Laudo'}
               </button>
               <button onClick={() => setSelectedRecordDetails(null)} className="px-10 py-6 bg-slate-100 text-slate-500 font-bold rounded-[32px] text-sm hover:bg-slate-200 transition-all uppercase tracking-widest">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Template */}
      <div id="pdf-export-area" className="fixed left-[-9999px] top-0 bg-white" style={{ width: '210mm' }}>
        {selectedRecordDetails && (
          <>
            {/* Page 1: Comprehensive Report */}
            <div id="pdf-page-1" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', backgroundColor: 'white', position: 'relative' }}>
               <header style={{ borderBottom: '3px solid #0c1a32', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', margin: '0', color: '#0c1a32', letterSpacing: '-1px' }}>SESC ESPÍRITO SANTO</h1>
                    <p style={{ fontSize: '11px', margin: '0', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Ambulatório de Saúde Integrada</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '16px', fontWeight: '900', margin: '0', color: '#ef4444' }}>PROTOCOLO #{selectedRecordDetails.id.toUpperCase()}</p>
                    <p style={{ fontSize: '10px', margin: '0', fontWeight: 'bold', color: '#94a3b8' }}>EMITIDO: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                  </div>
               </header>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                  {/* Identificação */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                     <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#0c1a32', textTransform: 'uppercase', marginBottom: '15px', borderLeft: '4px solid #3b82f6', paddingLeft: '10px' }}>Identificação do Paciente</h2>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
                        <p><strong>NOME:</strong> {selectedRecordDetails.patientName.toUpperCase()}</p>
                        <p><strong>IDADE:</strong> {selectedRecordDetails.age} ANOS</p>
                        <p><strong>SEXO:</strong> {selectedRecordDetails.gender.toUpperCase()}</p>
                        <p><strong>VÍNCULO:</strong> {selectedRecordDetails.patientType.toUpperCase()}</p>
                        <p><strong>TELEFONE:</strong> {selectedRecordDetails.phone || 'NÃO INFORMADO'}</p>
                        <p><strong>DATA/HORA OCORRÊNCIA:</strong> {new Date(selectedRecordDetails.occurrenceAt).toLocaleString('pt-BR')}</p>
                     </div>
                  </div>

                  {/* Localização e Motivo */}
                  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                     <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#0c1a32', textTransform: 'uppercase', marginBottom: '15px', borderLeft: '4px solid #f59e0b', paddingLeft: '10px' }}>Detalhes da Ocorrência</h2>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
                        <p><strong>ÁREA:</strong> {selectedRecordDetails.area.toUpperCase()}</p>
                        <p><strong>SUB-LOCAL:</strong> {selectedRecordDetails.subLocation.toUpperCase()}</p>
                        <p><strong>NATUREZA:</strong> {selectedRecordDetails.natureOfOccurrence.toUpperCase()}</p>
                        <p><strong>MOTIVO:</strong> {selectedRecordDetails.reason.toUpperCase()}</p>
                        <p><strong>GRAVIDADE:</strong> {selectedRecordDetails.severity.toUpperCase()}</p>
                        <p><strong>DESTINO:</strong> {selectedRecordDetails.destination.toUpperCase()}</p>
                     </div>
                  </div>

                  {/* Sinais Vitais */}
                  <div style={{ marginBottom: '10px' }}>
                     <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#0c1a32', textTransform: 'uppercase', marginBottom: '15px', borderLeft: '4px solid #10b981', paddingLeft: '10px' }}>Sinais Vitais</h2>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                        <div style={{ textAlign: 'center', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                           <p style={{ fontSize: '8px', color: '#059669', margin: '0', fontWeight: '900' }}>P.A</p>
                           <p style={{ fontSize: '16px', fontWeight: '900', margin: '5px 0 0 0' }}>{selectedRecordDetails.vitalSigns.pa} <small style={{ fontSize: '8px' }}>mmHg</small></p>
                        </div>
                        <div style={{ textAlign: 'center', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                           <p style={{ fontSize: '8px', color: '#dc2626', margin: '0', fontWeight: '900' }}>F.C</p>
                           <p style={{ fontSize: '16px', fontWeight: '900', margin: '5px 0 0 0' }}>{selectedRecordDetails.vitalSigns.fc} <small style={{ fontSize: '8px' }}>bpm</small></p>
                        </div>
                        <div style={{ textAlign: 'center', backgroundColor: '#fff7ed', padding: '12px', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                           <p style={{ fontSize: '8px', color: '#ea580c', margin: '0', fontWeight: '900' }}>TEMP</p>
                           <p style={{ fontSize: '16px', fontWeight: '900', margin: '5px 0 0 0' }}>{selectedRecordDetails.vitalSigns.temp} <small style={{ fontSize: '8px' }}>°C</small></p>
                        </div>
                        <div style={{ textAlign: 'center', backgroundColor: '#eff6ff', padding: '12px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                           <p style={{ fontSize: '8px', color: '#2563eb', margin: '0', fontWeight: '900' }}>SatO2</p>
                           <p style={{ fontSize: '16px', fontWeight: '900', margin: '5px 0 0 0' }}>{selectedRecordDetails.vitalSigns.sato2} <small style={{ fontSize: '8px' }}>%</small></p>
                        </div>
                     </div>
                  </div>

                  {/* Segurança e Alergias */}
                  <div style={{ padding: '20px', border: '2px solid #fee2e2', borderRadius: '15px', backgroundColor: '#fef2f2' }}>
                     <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#ef4444', textTransform: 'uppercase', marginBottom: '15px' }}>Segurança & Alergias</h2>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '10px' }}>
                        <p><strong>MEDICAMENTOS:</strong> {selectedRecordDetails.allergies.medication || 'NEGATIVO'}</p>
                        <p><strong>ALIMENTOS:</strong> {selectedRecordDetails.allergies.food || 'NEGATIVO'}</p>
                        <p><strong>OUTRAS:</strong> {selectedRecordDetails.allergies.others || 'NEGATIVO'}</p>
                     </div>
                  </div>

                  {/* Descrição e Conduta */}
                  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                     <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#0c1a32', textTransform: 'uppercase', marginBottom: '10px' }}>Descrição Clínica</h2>
                     <p style={{ fontSize: '11px', lineHeight: '1.6', marginBottom: '20px' }}>{selectedRecordDetails.description}</p>
                     
                     <h2 style={{ fontSize: '12px', fontWeight: '900', color: '#0c1a32', textTransform: 'uppercase', marginBottom: '10px' }}>Conduta e Procedimentos</h2>
                     <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>PROCEDIMENTOS: {selectedRecordDetails.procedures.join(' • ')}</p>
                     <div style={{ fontSize: '11px', lineHeight: '1.6', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                        {selectedRecordDetails.detailedConduct}
                     </div>
                  </div>

                  <footer style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '30px', textAlign: 'center' }}>
                     <div style={{ display: 'inline-block', borderTop: '2px solid #0c1a32', width: '300px', paddingTop: '10px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '900', margin: '0' }}>{selectedRecordDetails.responsibleTech.toUpperCase()}</p>
                        <p style={{ fontSize: '9px', margin: '2px 0 0 0', color: '#64748b' }}>Responsável Técnico pelo Atendimento</p>
                     </div>
                  </footer>
               </div>
            </div>

            {/* Page 2: Large Photo Annex */}
            {selectedRecordDetails.photoUrls.length > 0 && (
              <div id="pdf-page-2" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', backgroundColor: 'white' }}>
                 <header style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '900', margin: '0', color: '#0c1a32' }}>ANEXO FOTOGRÁFICO AMPLIADO</h2>
                    <p style={{ fontSize: '10px', margin: '5px 0 0 0', color: '#94a3b8' }}>Protocolo #{selectedRecordDetails.id.toUpperCase()} • {selectedRecordDetails.patientName.toUpperCase()}</p>
                 </header>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                    {selectedRecordDetails.photoUrls.map((url, i) => (
                       <div key={i} style={{ border: '2px solid #e2e8f0', borderRadius: '20px', padding: '20px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                          <img 
                            src={url} 
                            crossOrigin="anonymous"
                            style={{ width: '100%', height: 'auto', maxHeight: '180mm', borderRadius: '15px', objectFit: 'contain', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                          />
                          <p style={{ fontSize: '11px', fontWeight: '900', color: '#475569', marginTop: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>FIGURA {i+1} - EVIDÊNCIA CLÍNICA REGISTRADA NO ATO DO ATENDIMENTO</p>
                       </div>
                    ))}
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
