import { Schedule } from "../types";

export function getNextAlarm(schedule: Schedule): {
  time: string;
  isToday: boolean;
  minutesUntil: number;
} | null {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const futureTimes = schedule.times
    .map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const timeInMinutes = hours * 60 + minutes;
      return { time, timeInMinutes };
    })
    .filter((t) => t.timeInMinutes > currentTime)
    .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

  if (futureTimes.length > 0) {
    const next = futureTimes[0];
    const minutesUntil = next.timeInMinutes - currentTime;

    return {
      time: next.time,
      isToday: true,
      minutesUntil: minutesUntil,
    };
  }

  // If no more times today, get the first time for tomorrow
  const sortedTimes = schedule.times
    .map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return { time, timeInMinutes: hours * 60 + minutes };
    })
    .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

  if (sortedTimes.length > 0) {
    return {
      time: sortedTimes[0].time,
      isToday: false,
      minutesUntil: -1,
    };
  }

  return null;
}

export function formatTimeUntil(time: string): string {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);

  if (targetTime < now) {
    // If time has passed today, it's tomorrow
    targetTime.setDate(targetTime.getDate() + 1);
  }

  const diffMs = targetTime.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 60) {
    return `em ${diffMinutes} min`;
  } else if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    if (mins === 0) {
      return `em ${hours}h`;
    }
    return `em ${hours}h ${mins}min`;
  } else {
    return "amanhã";
  }
}
