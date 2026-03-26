export const pad2 = (n: number) => String(n).padStart(2, "0");

export const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`; // yyyy-MM-dd
};

export const toHm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; // HH:mm

export const formatTime = (d: Date) => toHm(d);