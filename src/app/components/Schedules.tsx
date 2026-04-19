import { useState, useEffect } from "react";
import { Plus, Clock, Trash2, Edit2, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { NotificationStatus } from "./NotificationStatus";
import { getNextAlarm, formatTimeUntil } from "../utils/alarmHelpers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import {
  getSchedules,
  saveSchedule,
  deleteSchedule,
  updateSchedule,
} from "../utils/storage";
import { getMedicines } from "../utils/storage";
import { Schedule, Medicine } from "../types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    medicineId: "",
    times: [""],
    frequency: "",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  // Update time every minute to refresh "next alarm" badges
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [schedulesData, medicinesData] = await Promise.all([
      getSchedules(),
      getMedicines(),
    ]);
    setSchedules(schedulesData);
    setMedicines(medicinesData);
  }

  function resetForm() {
    setFormData({
      medicineId: "",
      times: [""],
      frequency: "",
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setEditingSchedule(null);
  }

  function handleAddTime() {
    setFormData({ ...formData, times: [...formData.times, ""] });
  }

  function handleRemoveTime(index: number) {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes });
  }

  function handleTimeChange(index: number, value: string) {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.medicineId || formData.times.some((t) => !t)) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const medicine = medicines.find((m) => m.id === formData.medicineId);
    if (!medicine) return;

    try {
      if (editingSchedule) {
        const updatedSchedule: Schedule = {
          ...editingSchedule,
          medicineId: formData.medicineId,
          medicineName: medicine.name,
          times: formData.times,
          frequency: formData.frequency,
          startDate: new Date(formData.startDate),
          notes: formData.notes,
        };
        await updateSchedule(updatedSchedule);
        toast.success("Horário atualizado com sucesso!");
      } else {
        const schedule: Schedule = {
          id: crypto.randomUUID(),
          medicineId: formData.medicineId,
          medicineName: medicine.name,
          times: formData.times,
          frequency: formData.frequency,
          startDate: new Date(formData.startDate),
          notes: formData.notes,
        };
        await saveSchedule(schedule);
        toast.success("Horário criado com sucesso!");
      }

      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar o horário.");
    }
  }

  function handleEdit(schedule: Schedule) {
    setEditingSchedule(schedule);
    setFormData({
      medicineId: schedule.medicineId,
      times: schedule.times,
      frequency: schedule.frequency,
      startDate: new Date(schedule.startDate).toISOString().split("T")[0],
      notes: schedule.notes,
    });
    setIsDialogOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      await deleteSchedule(id);
      await loadData();
      setScheduleToDelete(null);
      toast.success("Horário excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir o horário.");
    }
  }

  // Group schedules by day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-green-800 dark:text-green-400">Horários dos Remédios</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure quando você precisa tomar seus medicamentos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationStatus />
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Horário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">
                  {editingSchedule ? "Editar Horário" : "Novo Horário"}
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Configure os horários para tomar seu medicamento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Medicine Selection */}
                <div className="space-y-2">
                  <Label htmlFor="medicine" className="dark:text-gray-200">
                    Remédio <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.medicineId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, medicineId: value })
                    }
                    required
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 dark:text-gray-100">
                      <SelectValue placeholder="Selecione o remédio" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {medicines.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                          Nenhum remédio cadastrado
                        </div>
                      ) : (
                        medicines.map((med) => (
                          <SelectItem key={med.id} value={med.id} className="dark:text-gray-100 dark:focus:bg-gray-700">
                            {med.name} - {med.dosage}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Times */}
                <div className="space-y-2">
                  <Label className="dark:text-gray-200">
                    Horários <span className="text-red-500">*</span>
                  </Label>
                  {formData.times.map((time, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 dark:text-gray-100"
                        required
                      />
                      {formData.times.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTime(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTime}
                    className="w-full border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Horário
                  </Button>
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="dark:text-gray-200">Frequência</Label>
                  <Input
                    id="frequency"
                    type="text"
                    placeholder="Ex: Diariamente, A cada 8 horas"
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="dark:text-gray-200">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="dark:text-gray-200">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ex: Tomar com alimentos"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                  >
                    {editingSchedule ? "Atualizar" : "Criar Horário"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-gray-800 dark:text-gray-100 mb-2">Nenhum horário configurado</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {medicines.length === 0
              ? "Você precisa cadastrar um remédio antes de configurar horários."
              : "Comece configurando os horários para seus medicamentos e receba lembretes automáticos quando for hora de tomar."}
          </p>
          {medicines.length > 0 && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Horário
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card
              key={schedule.id}
              className="p-5 bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-gray-800 dark:text-gray-100">{schedule.medicineName}</h3>
                    {schedule.frequency && (
                      <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70">
                        {schedule.frequency}
                      </Badge>
                    )}
                    {(() => {
                      const nextAlarm = getNextAlarm(schedule);
                      if (nextAlarm) {
                        let badgeClass = "";
                        if (nextAlarm.minutesUntil <= 10 && nextAlarm.minutesUntil > 0) {
                          badgeClass = "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70";
                        } else if (nextAlarm.minutesUntil <= 30 && nextAlarm.minutesUntil > 0) {
                          badgeClass = "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/70";
                        } else if (nextAlarm.isToday) {
                          badgeClass = "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/70";
                        } else {
                          badgeClass = "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
                        }

                        return (
                          <Badge className={badgeClass}>
                            <Bell className="w-3 h-3 mr-1" />
                            {formatTimeUntil(nextAlarm.time)}
                          </Badge>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Início:{" "}
                    {new Date(schedule.startDate).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(schedule)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setScheduleToDelete(schedule.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Times */}
              <div className="flex flex-wrap gap-3 mb-3">
                {schedule.times.sort().map((time, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-green-50 dark:bg-green-900/30 px-5 py-3 rounded-xl border border-green-100 dark:border-green-800"
                  >
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-lg font-medium text-green-800 dark:text-green-300">{time}</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {schedule.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {schedule.notes}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={scheduleToDelete !== null}
        onOpenChange={() => setScheduleToDelete(null)}
      >
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-gray-100">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Tem certeza que deseja excluir este horário? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => scheduleToDelete && handleDelete(scheduleToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
