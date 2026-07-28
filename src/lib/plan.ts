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
  operator?: string;
  otk?: string;
  finishedAt?: string;
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
  masterShift: string;
  sectionChief: string;
  operator: string;
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
        cells[s.processId] = {
          processId: s.processId,
          processName: s.processName,
          state,
          machineName: s.machineName,
          machineCode: s.machineCode,
          hours: s.totalHours,
          operator: rec?.operator,
          otk: rec?.otk,
          finishedAt: rec?.finishedAt,
        };
      });

      const a = order.assignments?.[it.item.id];
      rows.push({
        orderId: order.id,
        itemId: it.item.id,
        orderNumber: order.number,
        customer: order.customer,
        model: it.product.model,
        size: it.product.size,
        article: it.product.article,
        lengthM: it.lengthM,
        readiness: it.isSemi ? `п/ф до «${it.stageName}»` : "готовая",
        status: order.status,
        dueDate: order.dueDate,
        hours: it.productionHours,
        cells,
        masterShift: a?.masterShift ?? "",
        sectionChief: a?.sectionChief ?? "",
        operator: a?.operator ?? "",
      });
    }
  }
  return rows;
}
