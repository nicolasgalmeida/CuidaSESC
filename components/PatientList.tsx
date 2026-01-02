
import React, { useState } from 'react';
import { MedicalRecord, SeverityLevel, RecordStatus } from '../types';
import { Search, FileText, ChevronRight, Filter, Calendar, MapPin, Eye } from 'lucide-react';

interface PatientListProps {
  records: MedicalRecord[];
  onViewDetails: (record: MedicalRecord) => void;
}

const PatientList: React.FC<PatientListProps> = ({ records, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecords = records.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.subLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: RecordStatus) => {
    switch (status) {
      case 'Aberto': return 'bg-blue-100 text-blue-700';
      case 'Em andamento': return 'bg-amber-100 text-amber-700';
      case 'Aguardando retorno': return 'bg-purple-100 text-purple-700';
      case 'Fechado': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Prontuários Online</h2>
          <p className="text-slate-500 mt-1">Gerencie o histórico de atendimentos e acesse fichas detalhadas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar por paciente ou local..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 font-semibold shadow-sm">
            <Filter size={18} />
            Filtrar
          </button>
        </div>
      </header>

      {/* Desktop View Table */}
      <div className="hidden lg:block bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Paciente / Sexo</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Local / Data</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Gravidade</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                        {record.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg">{record.patientName}</p>
                        <p className="text-sm text-slate-500 font-medium">{record.age} anos • {record.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" /> {record.area}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                      <Calendar size={14} /> {new Date(record.occurrenceAt).toLocaleDateString('pt-BR')}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                      record.severity === SeverityLevel.LOW ? 'bg-emerald-100 text-emerald-700' :
                      record.severity === SeverityLevel.MEDIUM ? 'bg-amber-100 text-amber-700' :
                      record.severity === SeverityLevel.HIGH ? 'bg-orange-100 text-orange-700' :
                      'bg-red-500 text-white shadow-sm shadow-red-200'
                    }`}>
                      {record.severity}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(record.status)}`}>
                        {record.status}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onViewDetails(record)}
                        className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all font-bold text-sm shadow-md"
                      >
                        <Eye size={16} /> Ver Ficha
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {filteredRecords.map((record) => (
          <div key={record.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                  {record.patientName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{record.patientName}</h4>
                  <p className="text-xs text-slate-500">{record.age} anos • {record.gender}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyle(record.status)}`}>
                {record.status}
              </span>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => onViewDetails(record)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm"
              >
                <Eye size={16} /> Ver Ficha
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100">
          <Search size={32} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Nenhum registro encontrado</h3>
        </div>
      )}
    </div>
  );
};

export default PatientList;
