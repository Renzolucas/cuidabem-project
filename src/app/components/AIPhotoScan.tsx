import { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";

interface AIPhotoScanProps {
  onResult: (result: { imageUrl: string }) => void;
}

type Step = "start" | "preview";

export function AIPhotoScan({ onResult }: AIPhotoScanProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("start");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Limpa a URL temporária da imagem quando o componente fecha ou a foto muda
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleOpen() {
    setStep("start");
    setPreviewUrl(null);
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setStep("preview");
    }
  }

  function handleConfirmImage() {
    if (previewUrl) {
      onResult({ imageUrl: previewUrl });
      toast.success("Foto anexada com sucesso!");
      handleClose();
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        className="w-full border-dashed border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 h-12 gap-2"
      >
        <Camera className="w-4 h-4" />
        Anexar foto do medicamento
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
              <Camera className="w-5 h-5 text-green-600 dark:text-green-400" />
              Foto do Medicamento
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {step === "start" ? "Tire uma foto ou envie uma imagem da embalagem." : "Confirme se a foto está legível."}
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
                  <span className="text-sm text-green-800 dark:text-green-300 font-medium">Galeria</span>
                </button>
              </div>

              {/* Inputs escondidos */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={cameraInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* STEP: PREVIEW */}
          {step === "preview" && previewUrl && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border dark:border-gray-700 bg-black flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("start")}
                  className="flex-1 gap-2 dark:border-gray-700 dark:text-gray-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  Trocar
                </Button>
                <Button
                  onClick={handleConfirmImage}
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white gap-2"
                >
                  Confirmar Foto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
