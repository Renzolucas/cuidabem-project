import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, X, Sparkles, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { MedicineAIResult } from "../utils/aiHelpers";
import { useAuth } from "../contexts/AuthContext";
import { serverUrl } from "../contexts/AuthContext";
import { toast } from "sonner";

interface AIPhotoScanProps {
  onResult: (result: MedicineAIResult) => void;
}

type Step = "start" | "preview" | "loading" | "done";

export function AIPhotoScan({ onResult }: AIPhotoScanProps) {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("start");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<MedicineAIResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Limpa a URL temporária da imagem quando o componente fecha ou a foto muda (evita travar o celular)
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleOpen() {
    setStep("start");
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setStep("start");
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  }

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 20MB.");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep("preview");
  }, []);

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so the same file can be selected again
    e.target.value = "";
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleAnalyze() {
    if (!selectedFile || !session?.access_token) return;
    setStep("loading");
    try {
      const base64 = await fileToBase64(selectedFile);
      const res = await fetch(`${serverUrl}/analyze-medicine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ imageBase64: base64, mimeType: selectedFile.type }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Erro ${res.status} ao analisar imagem`);
      }
      setResult(data.result as MedicineAIResult);
      setStep("done");
    } catch (err: any) {
      console.error("AI analyze error:", err);
      toast.error(err.message || "Erro ao analisar a imagem. Tente novamente.");
      setStep("preview");
    }
  }

  function handleApplyResult() {
    if (result) {
      onResult(result);
      toast.success("Informações preenchidas automaticamente!");
      handleClose();
    }
  }

  const fieldsFound = result
    ? Object.entries(result).filter(([, v]) => v && String(v).trim()).length
    : 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        className="w-full border-dashed border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 h-12 gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Ler embalagem com IA
        <Camera className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
              <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
              Leitura com IA
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {step === "start" && "Tire uma foto ou envie uma imagem da embalagem do medicamento."}
              {step === "preview" && "Confirme a imagem antes de analisar."}
              {step === "loading" && "Analisando a imagem com inteligência artificial..."}
              {step === "done" && "Análise concluída! Confira as informações encontradas."}
            </DialogDescription>
          </DialogHeader>

          {/* STEP: START */}
          {step === "start" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group"
                >
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <Camera className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-green-800 dark:text-green-300 font-medium">Tirar Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group"
                >
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <Upload className="w-7 h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-green-800 dark:text-green-300 font-medium">Enviar Imagem</span>
                </button>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Powered by Google Gemini AI — sem necessidade de configuração
                </p>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          )}

          {/* STEP: PREVIEW */}
          {step === "preview" && previewUrl && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview da embalagem"
                  className="w-full rounded-xl object-contain max-h-64 bg-gray-100 dark:bg-gray-700"
                />
                <button
                  type="button"
                  onClick={() => { setStep("start"); setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  💡 Dica: Para melhores resultados, certifique-se de que a embalagem esteja bem iluminada e o texto legível.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setStep("start"); setSelectedFile(null); setPreviewUrl(null); }}
                  className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Trocar
                </Button>
                <Button
                  type="button"
                  onClick={handleAnalyze}
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analisar com IA
                </Button>
              </div>
            </div>
          )}

          {/* STEP: LOADING */}
          {step === "loading" && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-green-100 dark:border-green-900" />
                <div className="w-20 h-20 rounded-full border-4 border-green-500 border-t-transparent animate-spin absolute inset-0" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-800 dark:text-gray-100 font-medium">Analisando embalagem...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  O Gemini AI está lendo as informações do medicamento
                </p>
              </div>
            </div>
          )}

          {/* STEP: DONE */}
          {step === "done" && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-sm text-green-800 dark:text-green-300">
                  {fieldsFound} {fieldsFound === 1 ? "campo identificado" : "campos identificados"} na embalagem
                </p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {result.name && (
                  <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 pt-0.5">Nome</span>
                    <span className="text-sm text-gray-800 dark:text-gray-100">{result.name}</span>
                  </div>
                )}
                {result.dosage && (
                  <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 pt-0.5">Dosagem</span>
                    <span className="text-sm text-gray-800 dark:text-gray-100">{result.dosage}</span>
                  </div>
                )}
                {result.type && (
                  <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 pt-0.5">Tipo</span>
                    <span className="text-sm text-gray-800 dark:text-gray-100">{result.type}</span>
                  </div>
                )}
                {result.manufacturer && (
                  <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 pt-0.5">Fabricante</span>
                    <span className="text-sm text-gray-800 dark:text-gray-100">{result.manufacturer}</span>
                  </div>
                )}
                {result.description && (
                  <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 pt-0.5">Descrição</span>
                    <span className="text-sm text-gray-800 dark:text-gray-100">{result.description}</span>
                  </div>
                )}
                {result.sideEffects && (
                  <div className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0 pt-0.5">Efeitos Col.</span>
                    <span className="text-sm text-gray-800 dark:text-gray-100">{result.sideEffects}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setStep("start"); setSelectedFile(null); setPreviewUrl(null); setResult(null); }}
                  className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyResult}
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Usar esses dados
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
