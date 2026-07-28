import { PROCESSES } from "./data/catalog";
import { calcOrder } from "./calc";
import type { Order } from "./types";

export type CellState = "none" | "planned" | "current" | "done";

export interface PlanCell {
  processId: string;
  state: CellState;
  machineName: string;
  machineCode: string;
  processName: string;
  hours: number;
  /** Оператор, фактически принявший операцию (заполняется при завершении) */
  operator?: string;
  otk?: string;
  /** Мастер смены, фактически принявший операцию */
  actualMasterShift?: string;
  /** Начальник участка, фактически принявший операцию */
  actualSectionChief?: string;
  /** Вход — фактический момент поступления партии на передел (записан или унаследован) */
  arrivedAt?: string;
  /** Выход — момент завершения передела */
  finishedAt?: string;
  /** Простой перед переделом — разрыв между выходом с предыдущего передела и входом на этот, ч */
  idleHours?: number;
  /** Факт — время самой обработки на переделе (выход − вход), ч */
  factHours?: number;
  masterShift: string;
  sectionChief: string;
  assignedOperator: string;
}

export interface PlanRow {
  orderId: string;
  itemId: string;
  orderNumber: string;
  customer: string;
  model: string;
  size: string;
  article: string;
  lengthM: number;
  readiness: string;
  status: Order["status"];
  dueDate: string;
  hours: number;
  cells: Record<string, PlanCell | null>;
}

/** Колонки «Технологические переделы» — порядок как в плановом задании завода */
export const PLAN_COLUMNS = PROCESSES.map((p) => ({
  id: p.id,
  short: p.shortName,
  name: p.name,
  workshop: p.workshop,
}));

export const assignKey = (itemId: string) => itemId;

export function buildPlanRows(orders: Order[]): PlanRow[] {
  const rows: PlanRow[] = [];
  for (const order of orders) {
    const calc = calcOrder(order);
    const progress = order.progress ?? [];
    for (const it of calc.items) {
      const doneCount = progress.filter((p) => p.itemId === it.item.id).length;
      const cells: Record<string, PlanCell | null> = {};
      for (const col of PLAN_COLUMNS) cells[col.id] = null;

      it.steps.forEach((s, i) => {
        const rec = progress.find((p) => p.itemId === it.item.id && p.stepIndex === i);
        const state: CellState =
          order.status !== "в производстве" && !rec
            ? "planned"
            : rec
              ? "done"
              : i === doneCount
                ? "current"
                : "planned";
        const sa = order.stepAssignments?.[it.item.id]?.[s.processId];

        const prevRec = i > 0 ? progress.find((p) => p.itemId === it.item.id && p.stepIndex === i - 1) : undefined;
        const prevFinishedAt = i === 0 ? order.startedAt : prevRec?.finishedAt;
        const pendingStart = order.stepStarts?.[it.item.id]?.[i];
        const arrivedAt = rec?.startedAt ?? (state === "current" ? pendingStart : undefined);
        const idleHours =
          arrivedAt && prevFinishedAt
            ? Math.max(0, (new Date(arrivedAt).getTime() - new Date(prevFinishedAt).getTime()) / 3_600_000)
            : undefined;
        const factHours = rec ? (new Date(rec.finishedAt).getTime() - new Date(rec.startedAt).getTime()) / 3_600_000 : undefined;

        cells[s.processId] = {
          processId: s.processId,
          processName: s.processName,
          state,
          machineName: s.machineName,
          machineCode: s.machineCode,
          hours: s.totalHours,
          operator: rec?.operator,
          otk: rec?.otk,
          actualMasterShift: rec?.masterShift,
          actualSectionChief: rec?.sectionChief,
          arrivedAt,
          finishedAt: rec?.finishedAt,
          idleHours,
          factHours,
          masterShift: sa?.masterShift ?? "",
          sectionChief: sa?.sectionChief ?? "",
          assignedOperator: sa?.operator ?? "",
        };
      });

      rows.push({
        orderId: order.id,
        itemId: it.item.id,
        orderNumber: order.number,
        customer: order.customer,
        model: it.product.model,
        size: it.product.size,
        article: it.product.article,
        lengthM: it.lengthM,
        readiness: it.isSemi ? `П/Ф до «${it.stageName}»` : "ГП",
        status: order.status,
        dueDate: order.dueDate,
        hours: it.productionHours,
        cells,
      });
    }
  }
  return rows;
}
