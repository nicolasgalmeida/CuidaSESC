
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, User, MapPin, AlertTriangle, Clipboard, Activity, Stethoscope, Calendar, Clock, X, CheckCircle2 } from 'lucide-react';
import { MedicalRecord, SeverityLevel, PatientType, Gender, RecordStatus } from '../types';

const LOCATIONS = {
  'Hotéis': ['Hotel Principal', 'Vila dos Sonhos', 'Resort Premium', 'Área de Bangalôs'],
  'Piscinas': ['Piscina de Ondas', 'Rio Lento', 'Toboáguas Radicais', 'Área Infantil', 'Piscina Térmica'],
  'Vestiários': ['Vestiário Central', 'Vestiário Norte', 'Vestiário Sul'],
  'Restaurantes': ['Praça de Alimentação', 'Quiosque da Praia', 'Restaurante Deck', 'Bar Molhado'],
  'Área Social': ['Palco Principal', 'Entrada/Bilheteria', 'Lojas', 'Ambulatório Central'],
  'Parques': ['Trilha Ecológica', 'Playground', 'Quadras Esportivas']
};

const NATURES = [
  'Cortes', 'Afogamento', 'Escorregões', 'Quedas', 'Colisões', 'Entorses, luxações e fraturas',
  'Engasgamento', 'Queimaduras', 'Intoxicação', 'Insolação e desidratação', 
  'Picadas de insetos/peçonhentos', 'Queda de árvores/galhos', 'Mal súbito', 
  'Crises convulsivas', 'Ataques de pânico', 'Consumo Alcool', 'Agressões'
];

const REASONS = [
  'Falta de supervisão', 
  'Uso inadequado', 
  'Profundidade', 
  'Excesso de usuários', 
  'Pisos escorregadios', 
  'Ralos e escadas mal sinalizados', 
  'Iluminação inadequada', 
  'Mobiliário instável', 
  'Equipamentos danificados', 
  'Falta de sinalização de segurança', 
  'Outros'
];

const STANDARD_PROCEDURES = [
  'Limpeza',
  'Curativo de ferimentos superficiais',
  'Controle de sangramentos leves',
  'Imobilização',
  'Monitoramento de sinais vitais',
  'Repouso em leito',
  'Manobras de desobstrução de vias aéreas',
  'Aplicação de gelo',
  'Resfriamento com água corrente',
  'Orientação ao paciente'
];

const DESTINATIONS = [
  'Retornou ao Lazer/Parque',
  'Retornou ao Hotel/Resort',
  'Liberado para o Trabalho',
  'Removido por Meios Próprios',
  'Encaminhado p/ Hospital (Ambulância do Parque)',
  'Encaminhado p/ Hospital (SAMU)',
  'Encaminhado p/ Hospital (Corpo de Bombeiros)',
  'Alta após observação',
  'Transferência Externa'
];

const STATUS_OPTIONS: RecordStatus[] = ['Aberto', 'Em andamento', 'Aguardando retorno', 'Fechado'];

interface PatientFormProps {
  currentUserName: string;
  initialData?: MedicalRecord;
  onSave: (record: Omit<MedicalRecord, 'id' | 'createdAt' | 'createdBy'>) => void;
  onCancel: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ currentUserName, initialData, onSave, onCancel }) => {
  const isEditing = !!initialData;
  const now = new Date();
  
  // Lógica para datas de ocorrência (inicial ou edição)
  const initialDateStr = initialData ? new Date(initialData.occurrenceAt).toISOString().split('T')[0] : now.toISOString().split('T')[0];
  const initialTimeStr = initialData ? new Date(initialData.occurrenceAt).toTimeString().split(' ')[0].slice(0, 5) : now.toTimeString().split(' ')[0].slice(0, 5);

  const [formData, setFormData] = useState({
    patientName: initialData?.patientName || '',
    age: initialData?.age.toString() || '',
    gender: initialData?.gender || 'Masculino' as Gender,
    phone: initialData?.phone || '',
    patientType: initialData?.patientType || 'Hóspede' as PatientType,
    area: initialData?.area || 'Piscinas',
    subLocation: initialData?.subLocation || 'Piscina de Ondas',
    natureOfOccurrence: initialData?.natureOfOccurrence || 'Escorregões',
    reason: initialData?.reason || 'Uso inadequado',
    severity: initialData?.severity || SeverityLevel.LOW,
    description: initialData?.description || '',
    procedures: initialData?.procedures || [] as string[],
    detailedConduct: initialData?.detailedConduct || '',
    vitalSigns: initialData?.vitalSigns || { fc: '', pa: '', temp: '', sato2: '' },
    allergies: initialData?.allergies || { medication: '', food: '', others: '' },
    destination: initialData?.destination || 'Retornou ao Lazer/Parque',
    status: initialData?.status || 'Aberto' as RecordStatus,
    responsibleTech: initialData?.responsibleTech || currentUserName,
    photoUrls: initialData?.photoUrls || [] as string[],
    occurrenceDate: initialDateStr,
    occurrenceTime: initialTimeStr
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleProcedure = (proc: string) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.includes(proc)
        ? prev.procedures.filter(p => p !== proc)
        : [...prev.procedures, proc]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const occurrenceAt = new Date(`${formData.occurrenceDate}T${formData.occurrenceTime}`).toISOString();

    onSave({
      patientName: formData.patientName,
      age: parseInt(formData.age || '0'),
      gender: formData.gender,
      phone: formData.phone,
      patientType: formData.patientType,
      area: formData.area,
      subLocation: formData.subLocation,
      natureOfOccurrence: formData.natureOfOccurrence,
      reason: formData.reason,
      severity: formData.severity,
      description: formData.description,
      procedures: formData.procedures,
      detailedConduct: formData.detailedConduct,
      vitalSigns: formData.vitalSigns,
      allergies: formData.allergies,
      destination: formData.destination,
      status: formData.status,
      responsibleTech: formData.responsibleTech,
      photoUrls: formData.photoUrls,
      occurrenceAt: occurrenceAt
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photoUrls: [...prev.photoUrls, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-5xl mx-auto animate-slideUp pb-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Stethoscope className="text-red-500" /> {isEditing ? 'Editar Prontuário' : 'Novo Atendimento'}
            </h2>
            <p className="text-slate-400">SESC Espírito Santo • {isEditing ? `Protocolo #${initialData?.id.toUpperCase()}` : 'Prontuário Digital'}</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button type="button" onClick={onCancel} className="flex-1 md:flex-none px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all font-bold">Cancelar</button>
            <button type="submit" className="flex-1 md:flex-none px-8 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2">
              <Save size={18} /> {isEditing ? 'Salvar Alterações' : 'Salvar Atendimento'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Identificação e Tempo */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <Calendar className="text-red-500" size={20} />
                  <h3 className="text-lg font-bold text-slate-800">Dados Gerais</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Data da Ocorrência</label>
                    <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.occurrenceDate} onChange={e => setFormData({...formData, occurrenceDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Hora</label>
                    <input type="time" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.occurrenceTime} onChange={e => setFormData({...formData, occurrenceTime: e.target.value})} />
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Nome do Paciente</label>
                    <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 md:col-span-2">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Idade</label>
                      <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Vínculo</label>
                       <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.patientType} onChange={e => setFormData({...formData, patientType: e.target.value as PatientType})}>
                          <option>Hóspede</option>
                          <option>Day Use</option>
                          <option>Funcionário</option>
                          <option>Terceirizado</option>
                       </select>
                    </div>
                  </div>
               </div>
            </div>

            {/* RELATO DO CASO */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <Clipboard className="text-blue-500" size={20} />
                  <h3 className="text-lg font-bold text-slate-800">Relato do Caso</h3>
               </div>
               <textarea 
                  rows={4} 
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[24px] focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 leading-relaxed"
                  placeholder="Descreva o atendimento..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
               />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Natureza</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.natureOfOccurrence} onChange={e => setFormData({...formData, natureOfOccurrence: e.target.value})}>
                       {NATURES.map(n => <option key={n}>{n}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Gravidade</label>
                    <div className="flex gap-1">
                       {Object.values(SeverityLevel).map(lvl => (
                         <button key={lvl} type="button" onClick={() => setFormData({...formData, severity: lvl})} className={`flex-1 py-3 text-[9px] font-black rounded-lg border-2 transition-all ${formData.severity === lvl ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-slate-100 text-slate-400'}`}>
                           {lvl}
                         </button>
                       ))}
                    </div>
                 </div>
               </div>
            </div>

            {/* CONDUTA TÉCNICA */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  <h3 className="text-lg font-bold text-slate-800">Conduta Realizada</h3>
               </div>
               
               <div className="mb-8">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Procedimentos Efetuados</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                     {STANDARD_PROCEDURES.map(proc => (
                       <button
                         key={proc}
                         type="button"
                         onClick={() => toggleProcedure(proc)}
                         className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-xs font-bold transition-all ${
                           formData.procedures.includes(proc)
                             ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md scale-[1.02]'
                             : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                         }`}
                       >
                         <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.procedures.includes(proc) ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200'}`}>
                            {formData.procedures.includes(proc) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                         </div>
                         {proc}
                       </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Detalhamento Técnico</label>
                  <textarea 
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[24px] focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-slate-700 leading-relaxed"
                    placeholder="Complemente a conduta com observações específicas..."
                    value={formData.detailedConduct}
                    onChange={e => setFormData({...formData, detailedConduct: e.target.value})}
                  />
               </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Sinais Vitais */}
            <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-400">
                <Activity size={20} /> Sinais Vitais
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries({ PA: 'pa', FC: 'fc', TEMP: 'temp', SatO2: 'sato2' }).map(([lbl, key]) => (
                  <div key={key} className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{lbl}</label>
                    <input 
                      className="w-full bg-transparent text-xl font-mono text-emerald-400 outline-none" 
                      placeholder="---"
                      value={(formData.vitalSigns as any)[key]} 
                      onChange={e => setFormData({...formData, vitalSigns: {...formData.vitalSigns, [key]: e.target.value}})} 
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Status e Desfecho */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
               <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Status Atual</label>
                    <select 
                       className={`w-full px-4 py-3 border-2 rounded-xl outline-none font-bold transition-all ${
                          formData.status === 'Fechado' ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-blue-50 border-blue-200 text-blue-700 ring-4 ring-blue-50'
                       }`}
                       value={formData.status} 
                       onChange={e => setFormData({...formData, status: e.target.value as RecordStatus})}
                    >
                       {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Desfecho / Destino</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})}>
                       {DESTINATIONS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Evidências ({formData.photoUrls.length})</label>
                    <div className="grid grid-cols-3 gap-2">
                      {formData.photoUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                           <img src={url} className="w-full h-full object-cover" />
                           <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"><X size={10} /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                        <Camera size={20} />
                      </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
