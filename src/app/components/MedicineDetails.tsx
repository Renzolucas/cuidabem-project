import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Pill, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { getMedicineById } from "../utils/storage";
import { Medicine } from "../types";

export function MedicineDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    if (id) {
      const med = getMedicineById(id);
      if (med) {
        setMedicine(med);
      } else {
        navigate("/");
      }
    }
  }, [id, navigate]);

  if (!medicine) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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

      {/* Medicine Info Card */}
      <Card className="p-6 bg-white dark:bg-gray-800 border-green-100 dark:border-gray-700">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Pill className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-green-800 dark:text-green-400 mb-2">{medicine.name}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/70">
                {medicine.type}
              </Badge>
              <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70">
                {medicine.dosage}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Fabricante */}
          {medicine.manufacturer && (
            <div>
              <h3 className="text-gray-800 dark:text-gray-100 mb-2">Fabricante</h3>
              <p className="text-gray-600 dark:text-gray-400">{medicine.manufacturer}</p>
            </div>
          )}

          {/* Descrição */}
          {medicine.description && (
            <div>
              <h3 className="text-gray-800 dark:text-gray-100 mb-2">Descrição / Para que serve</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {medicine.description}
              </p>
            </div>
          )}

          {/* Efeitos Colaterais */}
          {medicine.sideEffects && (
            <div>
              <h3 className="text-gray-800 dark:text-gray-100 mb-2">Efeitos Colaterais</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {medicine.sideEffects}
              </p>
            </div>
          )}

          {/* Data de Cadastro */}
          <div>
            <h3 className="text-gray-800 dark:text-gray-100 mb-2">Cadastrado em</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {new Date(medicine.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Action */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border-green-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-gray-800 dark:text-gray-100">Configure os Horários</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Defina quando você precisa tomar este remédio
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/horarios")}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
          >
            Ir para Horários
          </Button>
        </div>
      </Card>
    </div>
  );
}
