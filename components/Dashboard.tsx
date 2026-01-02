
import React from 'react';
import { MedicalRecord, SeverityLevel } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { AlertCircle, Clock, TrendingUp, Users, HeartPulse, Stethoscope } from 'lucide-react';

interface DashboardProps {
  records: MedicalRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ records }) => {
  // Severity Data
  const severityData = [
    { name: 'Baixo', value: records.filter(r => r.severity === SeverityLevel.LOW).length, color: '#10b981' },
    { name: 'Médio', value: records.filter(r => r.severity === SeverityLevel.MEDIUM).length, color: '#f59e0b' },
    { name: 'Alto', value: records.filter(r => r.severity === SeverityLevel.HIGH).length, color: '#f97316' },
    { name: 'Crítico', value: records.filter(r => r.severity === SeverityLevel.CRITICAL).length, color: '#ef4444' },
  ];

  // Professional Data
  // Fix: Explicitly cast 'professionals' to string[] to avoid 'unknown' type errors during map iterations.
  const professionals = Array.from(new Set(records.map(r => r.responsibleTech))) as string[];
  const professionalData = professionals.map(name => ({
    name: name.split(' ').slice(0, 2).join(' '), // Shorten name
    value: records.filter(r => r.responsibleTech === name).length
  })).sort((a, b) => b.value - a.value);

  const stats = [
    { label: 'Total Atendimentos', value: records.length, icon: HeartPulse, color: 'blue' },
    { label: 'Casos Críticos', value: records.filter(r => r.severity === SeverityLevel.CRITICAL).length, icon: AlertCircle, color: 'red' },
    { label: 'Hoje', value: records.filter(r => new Date(r.occurrenceAt).toDateString() === new Date().toDateString()).length, icon: Clock, color: 'orange' },
    { label: 'Pacientes Únicos', value: Array.from(new Set(records.map(r => r.patientName))).length, icon: Users, color: 'emerald' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn w-full">
      <header>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">VISÃO GERAL</h2>
        <p className="text-slate-500 mt-1">Bem-vindo ao centro de gestão de atendimentos.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-5 group hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Severity Chart */}
        <div className="lg:col-span-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <TrendingUp className="text-red-500" size={24} />
              Volume por Gravidade
            </h3>
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full uppercase tracking-widest">Tempo Real</span>
          </div>
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#1e293b' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Professional Chart */}
        <div className="lg:col-span-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <Stethoscope className="text-blue-500" size={24} />
              Atendimentos por Profissional
            </h3>
          </div>
          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={professionalData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="6 6" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={100}
                  tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Records */}
        <div className="lg:col-span-12 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center justify-between">
            Últimos Movimentos
            <button className="text-xs font-black text-red-500 hover:underline uppercase tracking-widest">Ver Histórico Completo</button>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.slice(-6).reverse().map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer border border-transparent hover:border-slate-200">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`shrink-0 w-2.5 h-2.5 rounded-full ring-4 ${
                    record.severity === SeverityLevel.CRITICAL ? 'bg-red-500 ring-red-100' : 
                    record.severity === SeverityLevel.HIGH ? 'bg-orange-500 ring-orange-100' :
                    record.severity === SeverityLevel.MEDIUM ? 'bg-amber-500 ring-amber-100' : 'bg-emerald-500 ring-emerald-100'
                  }`} />
                  <div className="truncate">
                    <p className="font-bold text-slate-800 leading-none mb-1 truncate">{record.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{record.natureOfOccurrence} • {new Date(record.occurrenceAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
                  </div>
                </div>
                <div className="shrink-0 text-[9px] font-black px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 uppercase tracking-widest shadow-sm ml-2">
                  {record.status}
                </div>
              </div>
            ))}
          </div>
          {records.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300 opacity-50">
              <HeartPulse size={64} className="mb-4" />
              <p className="font-bold">Nenhum registro no sistema</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
