import type { Order, OrderItem, Product } from "./types";
import { MACHINES, PROCESSES } from "./data/catalog";
import { PRODUCTS, ROUTES } from "./data/products";

export interface StepCalc {
  processId: string;
  processName: string;
  workshop: string;
  machineName: string;
  machineCode: string;
  ratePerHour: number;
  setupMinutes: number;
  runHours: number;
  totalHours: number;
  note: string;
}

export interface ItemCalc {
  item: OrderItem;
  product: Product;
  lengthM: number;
  weightKg: number;
  copperKg: number;
  pvcKg: number;
  screenKg: number;
  armorKg: number;
  steps: StepCalc[];
  productionHours: number;
  drums: number;
  drumLength: number;
  price: number;
  materialCost: number;
}

export interface OrderCalc {
  items: ItemCalc[];
  totalLength: number;
  totalWeight: number;
  totalCopper: number;
  totalPvc: number;
  totalScreen: number;
  totalArmor: number;
  totalHours: number;
  totalShifts: number;
  totalDays: number;
  totalPrice: number;
  totalMaterialCost: number;
  workshopLoad: Array<{ workshop: string; hours: number }>;
  finishDate: string;
}

const SHIFT_HOURS = 8;
const SHIFTS_PER_DAY = 2;

export function calcItem(item: OrderItem): ItemCalc | null {
  const product = PRODUCTS.find((p) => p.id === item.productId);
  if (!product) return null;
  const route = ROUTES.find((r) => r.productId === product.id)!;
  const km = item.lengthM / 1000;

  const steps: StepCalc[] = route.steps.map((s) => {
    const proc = PROCESSES.find((p) => p.id === s.processId)!;
    const machine = MACHINES.find((m) => m.id === s.machineId)!;
    const runHours = item.lengthM / s.ratePerHour;
    return {
      processId: s.processId,
      processName: proc.name,
      workshop: proc.workshop,
      machineName: machine.name,
      machineCode: machine.code,
      ratePerHour: s.ratePerHour,
      setupMinutes: s.setupMinutes,
      runHours: Math.round(runHours * 100) / 100,
      totalHours: Math.round((runHours + s.setupMinutes / 60) * 100) / 100,
      note: s.note,
    };
  });

  const productionHours = Math.round(steps.reduce((a, s) => a + s.totalHours, 0) * 10) / 10;
  const drumLength = product.outerDiameter > 25 ? 500 : product.outerDiameter > 15 ? 1000 : 2000;
  const drums = item.drums > 0 ? item.drums : Math.max(1, Math.ceil(item.lengthM / drumLength));
  const copperKg = Math.round(product.copperKgPerKm * km * 10) / 10;
  const pvcKg = Math.round(product.pvcKgPerKm * km * 10) / 10;
  const screenKg = Math.round(product.screenKgPerKm * km * 10) / 10;
  const armorKg = Math.round(product.armorKgPerKm * km * 10) / 10;
  const materialCost = Math.round(
    copperKg * (product.conductorMaterial === "Медь" ? 118000 : 34000) +
      pvcKg * 24000 +
      screenKg * 52000 +
      armorKg * 12400,
  );

  return {
    item,
    product,
    lengthM: item.lengthM,
    weightKg: Math.round(product.weightKgPerKm * km),
    copperKg,
    pvcKg,
    screenKg,
    armorKg,
    steps,
    productionHours,
    drums,
    drumLength,
    price: Math.round(product.pricePerM * item.lengthM),
    materialCost,
  };
}

export function calcOrder(order: Pick<Order, "items">): OrderCalc {
  const items = order.items.map(calcItem).filter(Boolean) as ItemCalc[];
  const totalHours = Math.round(items.reduce((a, i) => a + i.productionHours, 0) * 10) / 10;
  const loadMap = new Map<string, number>();
  for (const it of items) {
    for (const s of it.steps) {
      loadMap.set(s.workshop, Math.round(((loadMap.get(s.workshop) ?? 0) + s.totalHours) * 10) / 10);
    }
  }
  const days = Math.ceil(totalHours / (SHIFT_HOURS * SHIFTS_PER_DAY));
  const finish = new Date();
  finish.setDate(finish.getDate() + Math.max(1, days));

  return {
    items,
    totalLength: items.reduce((a, i) => a + i.lengthM, 0),
    totalWeight: items.reduce((a, i) => a + i.weightKg, 0),
    totalCopper: Math.round(items.reduce((a, i) => a + i.copperKg, 0) * 10) / 10,
    totalPvc: Math.round(items.reduce((a, i) => a + i.pvcKg, 0) * 10) / 10,
    totalScreen: Math.round(items.reduce((a, i) => a + i.screenKg, 0) * 10) / 10,
    totalArmor: Math.round(items.reduce((a, i) => a + i.armorKg, 0) * 10) / 10,
    totalHours,
    totalShifts: Math.ceil(totalHours / SHIFT_HOURS),
    totalDays: days,
    totalPrice: items.reduce((a, i) => a + i.price, 0),
    totalMaterialCost: items.reduce((a, i) => a + i.materialCost, 0),
    workshopLoad: Array.from(loadMap, ([workshop, hours]) => ({ workshop, hours })).sort(
      (a, b) => b.hours - a.hours,
    ),
    finishDate: finish.toISOString().slice(0, 10),
  };
}

export const formatSum = (v: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(v))} сум`;
export const formatNum = (v: number, digits = 0) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(v);
export const formatHours = (h: number) => {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${hours} ч ${String(minutes).padStart(2, "0")} мин`;
};
