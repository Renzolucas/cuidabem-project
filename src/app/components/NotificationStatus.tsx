import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function NotificationStatus() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast.success("Notificações ativadas com sucesso!");
        // Test notification
        new Notification("CuidaBEM", {
          body: "Você receberá lembretes quando for hora de tomar seus remédios!",
          icon: "/pill-icon.png",
        });
      } else if (result === "denied") {
        toast.error("Você bloqueou as notificações. Você ainda verá alertas na tela.");
      }
    } else {
      toast.error("Seu navegador não suporta notificações.");
    }
  };

  if (!("Notification" in window)) {
    return null;
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-sm">
        <Bell className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-green-800 dark:text-green-400">Alarmes ativos</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg text-sm">
        <BellOff className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        <span className="text-orange-800 dark:text-orange-400">Notificações bloqueadas</span>
      </div>
    );
  }

  return (
    <Button
      onClick={requestPermission}
      variant="outline"
      size="sm"
      className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
    >
      <Bell className="w-4 h-4 mr-2" />
      Ativar Alarmes
    </Button>
  );
}
