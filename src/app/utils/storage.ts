import { Medicine, Schedule } from "../types";

// Current user prefix – set once on login
let _userPrefix = "global";

export function setStoragePrefix(userId: string) {
  _userPrefix = userId || "global";
}

function medicinesKey() {
  return `cuidaBEM_medicines_${_userPrefix}`;
}

function schedulesKey() {
  return `cuidaBEM_schedules_${_userPrefix}`;
}

// Medicines
export function getMedicines(): Medicine[] {
  const data = localStorage.getItem(medicinesKey());
  if (!data) return [];
  try {
    return JSON.parse(data).map((m: any) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
  } catch (error) {
    console.error("Erro ao ler medicamentos do storage:", error);
    return [];
  }
}

export function saveMedicine(medicine: Medicine): void {
  const medicines = getMedicines();
  medicines.push(medicine);
  localStorage.setItem(medicinesKey(), JSON.stringify(medicines));
}

export function updateMedicine(medicine: Medicine): void {
  const medicines = getMedicines();
  const index = medicines.findIndex((m) => m.id === medicine.id);
  if (index !== -1) {
    medicines[index] = medicine;
    localStorage.setItem(medicinesKey(), JSON.stringify(medicines));
  }
}

export function deleteMedicine(id: string): void {
  const medicines = getMedicines();
  const filtered = medicines.filter((m) => m.id !== id);
  localStorage.setItem(medicinesKey(), JSON.stringify(filtered));

  // Also delete related schedules
  const schedules = getSchedules();
  const filteredSchedules = schedules.filter((s) => s.medicineId !== id);
  localStorage.setItem(schedulesKey(), JSON.stringify(filteredSchedules));
}

export function getMedicineById(id: string): Medicine | undefined {
  const medicines = getMedicines();
  return medicines.find((m) => m.id === id);
}

// Schedules
export function getSchedules(): Schedule[] {
  const data = localStorage.getItem(schedulesKey());
  if (!data) return [];
  try {
    return JSON.parse(data).map((s: any) => ({
      ...s,
      startDate: new Date(s.startDate),
    }));
  } catch (error) {
    console.error("Erro ao ler horários do storage:", error);
    return [];
  }
}

export function saveSchedule(schedule: Schedule): void {
  const schedules = getSchedules();
  schedules.push(schedule);
  localStorage.setItem(schedulesKey(), JSON.stringify(schedules));
}

export function updateSchedule(schedule: Schedule): void {
  const schedules = getSchedules();
  const index = schedules.findIndex((s) => s.id === schedule.id);
  if (index !== -1) {
    schedules[index] = schedule;
    localStorage.setItem(schedulesKey(), JSON.stringify(schedules));
  }
}

export function deleteSchedule(id: string): void {
  const schedules = getSchedules();
  const filtered = schedules.filter((s) => s.id !== id);
  localStorage.setItem(schedulesKey(), JSON.stringify(filtered));
}

export function getSchedulesByMedicineId(medicineId: string): Schedule[] {
  const schedules = getSchedules();
  return schedules.filter((s) => s.medicineId === medicineId);
}
