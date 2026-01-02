
export enum SeverityLevel {
  LOW = 'BAIXO',
  MEDIUM = 'MÉDIO',
  HIGH = 'ALTO',
  CRITICAL = 'CRÍTICO'
}

export type PatientType = 'Hóspede' | 'Day Use' | 'Funcionário' | 'Terceirizado';
export type RecordStatus = 'Aberto' | 'Em andamento' | 'Aguardando retorno' | 'Fechado';
export type Gender = 'Masculino' | 'Feminino' | 'Outro';
export type UserRole = 'Gestor' | 'Técnico Enfermagem';

export interface SystemUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  coren: string;
  email: string;
  password?: string;
}

export interface VitalSigns {
  fc: string; 
  pa: string; 
  temp: string; 
  sato2: string; 
}

export interface Allergies {
  medication: string;
  food: string;
  others: string;
}

export interface MedicalRecord {
  id: string;
  patientName: string;
  age: number;
  gender: Gender;
  phone: string;
  patientType: PatientType;
  area: string;
  subLocation: string;
  natureOfOccurrence: string;
  reason: string;
  severity: SeverityLevel;
  description: string;
  procedures: string[];
  detailedConduct: string;
  vitalSigns: VitalSigns;
  allergies: Allergies;
  destination: string;
  status: RecordStatus;
  responsibleTech: string;
  photoUrls: string[]; 
  occurrenceAt: string; 
  createdAt: string;    
  createdBy: string;
  report?: string;
}

export interface ShiftNote {
  id: string;
  content: string;
  type: 'Turno' | 'Lembrete';
  author: string;
  createdAt: string;
  reminderAt?: string; // Data/Hora do alarme
  isResolved: boolean;
  alarmPlayed?: boolean; // Controle de disparo sonoro
}

export type AppView = 'login' | 'dashboard' | 'patients' | 'users' | 'new-record' | 'reports' | 'handover';
