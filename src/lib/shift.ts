export interface ShiftDef {
  number: 1 | 2;
  startH: number;
  endH: number;
  label: string;
}

export const SHIFTS: ShiftDef[] = [
  { number: 1, startH: 8, endH: 20, label: "Смена 1 (08:00–20:00)" },
  { number: 2, startH: 20, endH: 8, label: "Смена 2 (20:00–08:00)" },
];

function shiftWindow(anchorDay: Date, shift: ShiftDef) {
  const start = new Date(anchorDay);
  start.setHours(shift.startH, 0, 0, 0);
  const end = new Date(anchorDay);
  if (shift.endH <= shift.startH) end.setDate(end.getDate() + 1);
  end.setHours(shift.endH, 0, 0, 0);
  return { start, end };
}

/** Текущая смена и время до её окончания */
export function currentShift(now = new Date()) {
  const h = now.getHours();
  const shift = h >= SHIFTS[0].startH && h < SHIFTS[0].endH ? SHIFTS[0] : SHIFTS[1];
  const anchorDay = new Date(now);
  if (shift.number === 2 && h < SHIFTS[0].startH) anchorDay.setDate(anchorDay.getDate() - 1);
  const { start, end } = shiftWindow(anchorDay, shift);
  return { ...shift, start, end, remainingMs: Math.max(0, end.getTime() - now.getTime()) };
}

export function shiftNumberFor(iso: string): 1 | 2 {
  const h = new Date(iso).getHours();
  return h >= SHIFTS[0].startH && h < SHIFTS[0].endH ? 1 : 2;
}

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Дни текущей недели (Пн—Вс), со сдвигом на offset недель от сегодня */
export function weekDays(offset = 0, today = new Date()): Date[] {
  const d = new Date(today);
  d.setDate(d.getDate() + offset * 7);
  const dow = (d.getDay() + 6) % 7; // Пн = 0
  d.setDate(d.getDate() - dow);
  d.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
}

export const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const durationShort = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h} ч ${String(m).padStart(2, "0")} мин`;
};
