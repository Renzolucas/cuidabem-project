import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Search, Pill, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { getMedicines, deleteMedicine } from "../utils/storage";
import { Medicine } from "../types";
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

export function MedicineList() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [medicineToDelete, setMedicineToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadMedicines();
  }, []);

  function loadMedicines() {
    setMedicines(getMedicines());
  }

  function handleDelete(id: string) {
    deleteMedicine(id);
    loadMedicines();
    setMedicineToDelete(null);
    toast.success("Remédio excluído com sucesso!");
  }

  const filteredMedicines = medicines.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-green-800 dark:text-green-400">Meus Remédios</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seus medicamentos cadastrados
          </p>
        </div>
        <Link to="/adicionar">
          <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Remédio
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <Input
          type="text"
          placeholder="Buscar remédio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white dark:bg-gray-800 border-green-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>

      {/* Medicine List */}
      {filteredMedicines.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-gray-800 dark:text-gray-100 mb-2">Nenhum remédio cadastrado</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm
              ? "Nenhum remédio encontrado com esse nome."
              : "Comece adicionando seu primeiro medicamento."}
          </p>
          {!searchTerm && (
            <Link to="/adicionar">
              <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Remédio
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMedicines.map((medicine) => (
            <Card
              key={medicine.id}
              className="p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                    <Pill className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-800 dark:text-gray-100">{medicine.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{medicine.type}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                  onClick={() => setMedicineToDelete(medicine.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Dosagem</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{medicine.dosage}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Fabricante</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{medicine.manufacturer}</p>
                </div>
              </div>
              <Link to={`/remedio/${medicine.id}`}>
                <Button
                  variant="outline"
                  className="w-full border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                >
                  Ver Detalhes
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={medicineToDelete !== null}
        onOpenChange={() => setMedicineToDelete(null)}
      >
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-gray-100">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Tem certeza que deseja excluir este remédio? Esta ação não pode
              ser desfeita e todos os horários relacionados também serão
              excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => medicineToDelete && handleDelete(medicineToDelete)}
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
