export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  type: string; // comprimido, cápsula, xarope, etc
  manufacturer: string;
  description: string;
  sideEffects: string;
  createdAt: Date;
}

export interface Schedule {
  id: string;
  medicineId: string;
  medicineName: string;
  times: string[]; // Array de horários no formato "HH:MM"
  frequency: string; // Ex: "Diariamente", "A cada 8 horas", etc
  startDate: Date;
  notes: string;
}
