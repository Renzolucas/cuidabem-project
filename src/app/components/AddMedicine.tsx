import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Pill } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { saveMedicine } from "../utils/storage";
import { Medicine } from "../types";
import { toast } from "sonner";

const MEDICINE_TYPES = [
  "Comprimido",
  "Cápsula",
  "Xarope",
  "Gotas",
  "Injeção",
  "Pomada",
  "Spray",
  "Outro",
];

export function AddMedicine() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    type: "",
    manufacturer: "",
    description: "",
    sideEffects: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name || !formData.dosage || !formData.type) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    const medicine: Medicine = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: new Date(),
    };

    try {
      await saveMedicine(medicine);
      toast.success("Remédio adicionado com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao salvar o remédio.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
          <Pill className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-green-800 dark:text-green-400">Adicionar Remédio</h2>
          <p className="text-gray-600 dark:text-gray-400">Cadastre um novo medicamento</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6 bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="dark:text-gray-200">
              Nome do Remédio <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Paracetamol"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-500 transition-all"
              required
            />
          </div>

          {/* Dosagem e Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage" className="dark:text-gray-200">
                Dosagem <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dosage"
                type="text"
                placeholder="Ex: 500mg"
                value={formData.dosage}
                onChange={(e) =>
                  setFormData({ ...formData, dosage: e.target.value })
                }
                className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="dark:text-gray-200">
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
                required
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 dark:text-gray-100 transition-all">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {MEDICINE_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="dark:text-gray-100 dark:focus:bg-gray-700">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fabricante */}
          <div className="space-y-2">
            <Label htmlFor="manufacturer" className="dark:text-gray-200">Fabricante</Label>
            <Input
              id="manufacturer"
              type="text"
              placeholder="Ex: EMS"
              value={formData.manufacturer}
              onChange={(e) =>
                setFormData({ ...formData, manufacturer: e.target.value })
              }
              className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-500 transition-all"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-gray-200">Descrição / Para que serve</Label>
            <Textarea
              id="description"
              placeholder="Ex: Analgésico e antitérmico usado para dor e febre"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-500 min-h-20 transition-all"
            />
          </div>

          {/* Efeitos Colaterais */}
          <div className="space-y-2">
            <Label htmlFor="sideEffects" className="dark:text-gray-200">Efeitos Colaterais</Label>
            <Textarea
              id="sideEffects"
              placeholder="Ex: Náuseas, dor de cabeça, sonolência"
              value={formData.sideEffects}
              onChange={(e) =>
                setFormData({ ...formData, sideEffects: e.target.value })
              }
              className="bg-white dark:bg-gray-700 border-green-200 dark:border-gray-600 focus:border-green-400 dark:focus:border-green-500 dark:text-gray-100 dark:placeholder-gray-500 min-h-20 transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              className="flex-1 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
            >
              Salvar Remédio
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
