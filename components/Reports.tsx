
import React, { useState } from 'react';
import { MedicalRecord, SeverityLevel, PatientType, RecordStatus } from '../types';
import { Download, Filter, MapPin, Calendar, Tag, Shield, Navigation, Edit2 } from 'lucide-react';

interface ReportsProps {
  records: MedicalRecord[];
  onEditRecord: (record: MedicalRecord) => void;
}

const Reports: React.FC<ReportsProps> = ({ records, onEditRecord }) => {
  const [filters, setFilters] = useState({
    severity: '' as SeverityLevel | '',
    patientType: '' as PatientType | '',
    status: '' as RecordStatus | '',
    startDate: '',
    endDate: '',
    area: ''
  });

  const filteredRecords = records.filter(record => {
    const recordDate = new Date(record.occurrenceAt).toISOString().split('T')[0];
    const matchSeverity = !filters.severity || record.severity === filters.severity;
    const matchPatientType = !filters.patientType || record.patientType === filters.patientType;
    const matchStatus = !filters.status || record.status === filters.status;
    const matchArea = !filters.area || record.area === filters.area;
    const matchStart = !filters.startDate || recordDate >= filters.startDate;
    const matchEnd = !filters.endDate || recordDate <= filters.endDate;
    
    return matchSeverity && matchPatientType && matchStatus && matchArea && matchStart && matchEnd;
  });

  const getStatusStyle = (status: RecordStatus) => {
    switch (status) {
      case 'Aberto': return 'bg-blue-100 text-blue-700';
      case 'Em andamento': return 'bg-amber-100 text-amber-700';
      case 'Aguardando retorno': return 'bg-purple-100 text-purple-700';
      case 'Fechado': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const exportCSV = () => {
    if (filteredRecords.length === 0) return alert('Nenhum dado para exportar');

    // Cabeçalhos expandidos para cobrir todas as informações
    const headers = [
      'ID Protocolo',
      'Paciente',
      'Idade',
      'Sexo',
      'Telefone',
      'Tipo de Vínculo',
      'Área',
      'Sub-Localização',
      'Natureza da Ocorrência',
      'Motivo',
      'Gravidade',
      'Relato do Caso',
      'Procedimentos Realizados',
      'Detalhamento da Conduta',
      'FC (bpm)',
      'PA (mmHg)',
      'Temp (°C)',
      'SatO2 (%)',
      'Alergia: Medicamento',
      'Alergia: Alimentar',
      'Alergia: Outras',
      'Destino Final',
      'Status Atual',
      'Responsável Técnico',
      'Data/Hora Ocorrência',
      'Data de Registro',
      'Criado Por'
    ];

    const rows = filteredRecords.map(r => [
      r.id.toUpperCase(),
      r.patientName,
      r.age,
      r.gender,
      r.phone,
      r.patientType,
      r.area,
      r.subLocation,
      r.natureOfOccurrence,
      r.reason,
      r.severity,
      r.description,
      r.procedures.join(', '),
      r.detailedConduct,
      r.vitalSigns.fc,
      r.vitalSigns.pa,
      r.vitalSigns.temp,
      r.vitalSigns.sato2,
      r.allergies.medication || 'Negativo',
      r.allergies.food || 'Negativo',
      r.allergies.others || 'Negativo',
      r.destination,
      r.status,
      r.responsibleTech,
      new Date(r.occurrenceAt).toLocaleString('pt-BR'),
      new Date(r.createdAt).toLocaleString('pt-BR'),
      r.createdBy
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => {
        // Sanitização: escapa aspas duplas e garante que o conteúdo não quebre o CSV
        const safeCell = String(cell ?? '').replace(/"/g, '""');
        return `"${safeCell}"`;
      }).join(';'))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `CUIDASESC_FULL_EXPORT_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Centro de Relatórios</h2>
          <p className="text-slate-500 mt-1">Extraia dados analíticos e exporte registros completos para auditoria.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
        >
          <Download size={20} /> Exportar CSV Completo
        </button>
      </header>

      {/* Filter Bar */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 text-slate-400 mb-6 text-sm font-bold uppercase tracking-widest">
          <Filter size={16} /> Filtros Dinâmicos
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Gravidade</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={filters.severity} onChange={e => setFilters({...filters, severity: e.target.value as SeverityLevel})}>
              <option value="">Todas</option>
              {Object.values(SeverityLevel).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Tipo Paciente</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={filters.patientType} onChange={e => setFilters({...filters, patientType: e.target.value as PatientType})}>
              <option value="">Todos</option>
              <option value="Hóspede">Hóspede</option>
              <option value="Day Use">Day Use</option>
              <option value="Funcionário">Funcionário</option>
              <option value="Terceirizado">Terceirizado</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Status</label>
            <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={filters.status} onChange={e => setFilters({...filters, status: e.target.value as RecordStatus})}>
              <option value="">Todos</option>
              <option value="Aberto">Aberto</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Aguardando retorno">Aguardando retorno</option>
              <option value="Fechado">Fechado</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Data Inicial</label>
            <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Data Final</label>
            <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
              value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setFilters({severity: '', patientType: '', status: '', startDate: '', endDate: '', area: ''})}
              className="w-full py-2.5 px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <h3 className="font-bold text-slate-800">Resultados Filtrados ({filteredRecords.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo/Local</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gravidade</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-800">{r.patientName}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{r.phone}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1"><Tag size={12} className="text-slate-300"/> {r.patientType}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin size={12} className="text-slate-300"/> {r.area}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      r.severity === SeverityLevel.LOW ? 'bg-emerald-100 text-emerald-700' :
                      r.severity === SeverityLevel.CRITICAL ? 'bg-red-500 text-white' : 
                      r.severity === SeverityLevel.HIGH ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => onEditRecord(r)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider shadow-sm"
                    >
                      <Edit2 size={12} /> Editar Ficha
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    Nenhum registro corresponde aos filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
