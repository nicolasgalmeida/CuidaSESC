
import { GoogleGenAI } from "@google/genai";
import { MedicalRecord } from "../types";

export const generateProfessionalReport = async (record: MedicalRecord): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um médico coordenador de ambulatório em um parque aquático, escreva um LAUDO MÉDICO profissional detalhado com base nos seguintes dados:
    
    PACIENTE: ${record.patientName} (${record.age} anos, ${record.gender})
    TIPO: ${record.patientType}
    LOCAL: ${record.area} - ${record.subLocation}
    
    OCORRÊNCIA: ${record.natureOfOccurrence}
    MOTIVO: ${record.reason}
    GRAVIDADE: ${record.severity}
    
    SINAIS VITAIS:
    - Freq. Cardíaca: ${record.vitalSigns.fc} bpm
    - Pressão Arterial: ${record.vitalSigns.pa} mmHg
    - Temperatura: ${record.vitalSigns.temp} °C
    - Saturação O2: ${record.vitalSigns.sato2} %
    
    ALERGIAS:
    - Medicamentos: ${record.allergies.medication || 'Negativo'}
    - Alimentos: ${record.allergies.food || 'Negativo'}
    - Outros: ${record.allergies.others || 'Negativo'}
    
    DESCRIÇÃO CLÍNICA: ${record.description}
    DESTINO: ${record.destination}
    STATUS: ${record.status}
    RESPONSÁVEL TÉCNICO: ${record.responsibleTech} (Técnico Enfermagem)
    
    O laudo deve ser estruturado em Markdown, profissional, com terminologia médica correta e incluir:
    1. Cabeçalho oficial do Ambulatório do Parque.
    2. Anamnese e Exame Físico resumido.
    3. Conduta realizada.
    4. Recomendações e Plano de Cuidado.
    5. Espaço para carimbo e assinatura.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Erro ao gerar o laudo.";
  } catch (error) {
    console.error("Error generating report:", error);
    return "Erro ao processar dados via IA.";
  }
};
