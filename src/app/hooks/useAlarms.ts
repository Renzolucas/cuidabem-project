import { useEffect, useRef } from "react";
import { getSchedules } from "../utils/storage";
import { toast } from "sonner";

// Play a notification sound using Web Audio API
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = 0.3;
    const frequency = 800;

    // Create oscillator for a pleasant beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    // Second beep
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      oscillator2.frequency.value = frequency * 1.2;
      oscillator2.type = "sine";

      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + duration);
    }, 150);
  } catch (e) {
    // Ignore audio errors
    console.log("Could not play notification sound:", e);
  }
}

export function useAlarms() {
  const notifiedTimesRef = useRef<Set<string>>(new Set());
  const notificationPermissionRef = useRef<NotificationPermission | null>(null);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          notificationPermissionRef.current = permission;
          if (permission === "granted") {
            toast.success("Notificações ativadas! Você será avisado quando for hora de tomar seus remédios.");
          } else if (permission === "denied") {
            toast.info("As notificações foram bloqueadas. Você verá alertas na tela.");
          }
        });
      } else {
        notificationPermissionRef.current = Notification.permission;
      }
    }
  }, []);

  // Check alarms every minute
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const currentDate = now.toDateString();

      const schedules = getSchedules();

      schedules.forEach((schedule) => {
        schedule.times.forEach((time) => {
          const notificationKey = `${schedule.id}-${time}-${currentDate}`;

          // Check if it's time and we haven't notified yet today
          if (time === currentTime && !notifiedTimesRef.current.has(notificationKey)) {
            notifiedTimesRef.current.add(notificationKey);

            const message = `Hora de tomar ${schedule.medicineName}!`;
            const body = schedule.notes
              ? `${schedule.frequency ? schedule.frequency + " - " : ""}${schedule.notes}`
              : schedule.frequency || "Não esqueça de tomar seu medicamento";

            // Try browser notification first
            if ("Notification" in window && Notification.permission === "granted") {
              const notification = new Notification(message, {
                body: body,
                icon: "/pill-icon.png", // You can add an icon if available
                badge: "/pill-badge.png",
                tag: notificationKey,
                requireInteraction: true, // Keeps notification visible until user interacts
                vibrate: [200, 100, 200], // Vibration pattern for mobile
              });

              notification.onclick = () => {
                window.focus();
                notification.close();
              };
            }

            // Always show toast notification as backup
            toast.info(message, {
              description: body,
              duration: 30000, // 30 seconds
              action: {
                label: "OK",
                onClick: () => {},
              },
            });

            // Play notification sound
            playNotificationSound();
          }
        });
      });

      // Clean up old notifications (older than today)
      const keysToDelete: string[] = [];
      notifiedTimesRef.current.forEach((key) => {
        if (!key.endsWith(currentDate)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => notifiedTimesRef.current.delete(key));
    };

    // Check immediately
    checkAlarms();

    // Check every minute
    const interval = setInterval(checkAlarms, 60000);

    return () => clearInterval(interval);
  }, []);
}
