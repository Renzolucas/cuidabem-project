import { Medicine, Schedule } from "../types";
import { getSupabase } from "../contexts/AuthContext";

// Auxiliar para converter datas vindas do Supabase
const mapMedicine = (m: any): Medicine => ({
  ...m,
  createdAt: new Date(m.created_at || m.createdAt),
});

const mapSchedule = (s: any): Schedule => ({
  ...s,
  startDate: new Date(s.start_date || s.startDate),
  times: Array.isArray(s.times) ? s.times : JSON.parse(s.times || "[]"),
});

// Medicines
export async function getMedicines(): Promise<Medicine[]> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar medicamentos:", error);
    return [];
  }

  return (data || []).map(mapMedicine);
}

export async function saveMedicine(medicine: Medicine): Promise<void> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("medicines").insert([
    {
      id: medicine.id,
      user_id: user.id,
      name: medicine.name,
      dosage: medicine.dosage,
      type: medicine.type,
      manufacturer: medicine.manufacturer,
      description: medicine.description,
      side_effects: medicine.sideEffects,
      created_at: medicine.createdAt.toISOString(),
    },
  ]);

  if (error) throw error;
}

export async function updateMedicine(medicine: Medicine): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("medicines")
    .update({
      name: medicine.name,
      dosage: medicine.dosage,
      type: medicine.type,
      manufacturer: medicine.manufacturer,
      description: medicine.description,
      side_effects: medicine.sideEffects,
    })
    .eq("id", medicine.id);

  if (error) throw error;
}

export async function deleteMedicine(id: string): Promise<void> {
  const supabase = getSupabase();
  
  // Exclui horários relacionados primeiro (ou confia no ON DELETE CASCADE se configurado)
  await supabase.from("schedules").delete().eq("medicine_id", id);
  
  const { error } = await supabase.from("medicines").delete().eq("id", id);
  if (error) throw error;
}

export async function getMedicineById(id: string): Promise<Medicine | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;
  return mapMedicine(data);
}

// Schedules
export async function getSchedules(): Promise<Schedule[]> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao buscar horários:", error);
    return [];
  }

  return (data || []).map(mapSchedule);
}

export async function saveSchedule(schedule: Schedule): Promise<void> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("schedules").insert([
    {
      id: schedule.id,
      user_id: user.id,
      medicine_id: schedule.medicineId,
      medicine_name: schedule.medicineName,
      times: schedule.times,
      frequency: schedule.frequency,
      start_date: schedule.startDate.toISOString(),
      notes: schedule.notes,
    },
  ]);

  if (error) throw error;
}

export async function updateSchedule(schedule: Schedule): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("schedules")
    .update({
      times: schedule.times,
      frequency: schedule.frequency,
      start_date: schedule.startDate.toISOString(),
      notes: schedule.notes,
      medicine_id: schedule.medicineId,
      medicine_name: schedule.medicineName,
    })
    .eq("id", schedule.id);

  if (error) throw error;
}

export async function deleteSchedule(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (error) throw error;
}

export async function getSchedulesByMedicineId(medicineId: string): Promise<Schedule[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("medicine_id", medicineId);

  if (error) return [];
  return (data || []).map(mapSchedule);
}
