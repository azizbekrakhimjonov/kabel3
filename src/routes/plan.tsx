import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NameSelect } from "@/components/NameSelect";
import { useApp } from "@/lib/store";
import { PLAN_COLUMNS, buildPlanRows, type PlanRow } from "@/lib/plan";
import { formatNum, formatHours } from "@/lib/calc";
import { Download, Printer, Table2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "План-задание цехам — CTMS кабельный завод" },
      {
        name: "description",
        content:
          "План-задание по заказам: технологические переделы, станки, ответственные мастера и выгрузка в Excel.",
      },
      { property: "og:title", content: "План-задание цехам — CTMS" },
      {
        property: "og:description",
        content: "Матрица переделов по заказам с цветовой индикацией пройденных операций.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlanPage,
});

const CELL_BG: Record<string, string> = {
  done: "#FFD54A",
  current: "#FFF3B0",
  planned: "#FFFFFF",
  none: "#F1F1F1",
};

const IDLE_THRESHOLD_H = 0.02;

const fmtClock = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function PlanPage() {
  const { orders, setStepAssignment } = useApp();
  const [q, setQ] = useState("");
  const date = new Date().toLocaleDateString("ru-RU");
  const rows = useMemo(() => buildPlanRows(orders), [orders]);
  const filtered = rows.filter((r) =>
    `${r.orderNumber} ${r.customer} ${r.model} ${r.size}`.toLowerCase().includes(q.toLowerCase()),
  );
  const usedColumns = PLAN_COLUMNS.filter((c) => rows.some((r) => r.cells[c.id]));
  const columns = usedColumns.length ? usedColumns : PLAN_COLUMNS;

  const exportExcel = () => {
    if (!filtered.length) {
      toast.error("Нет позиций для выгрузки");
      return;
    }
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const head = [
      "№",
      "Заказ",
      "Заказчик",
      "Марка",
      "Сечение",
      "Метраж, м",
      "Вид выпуска",
      "Срок",
      "Норма, ч",
      ...columns.map((c) => c.short),
    ];
    const body = filtered
      .map((r, i) => {
        const base = [
          String(i + 1),
          r.orderNumber,
          r.customer,
          r.model,
          r.size,
          String(r.lengthM),
          r.readiness,
          r.dueDate,
          String(r.hours),
        ]
          .map((v) => `<td>${esc(v)}</td>`)
          .join("");
        const cells = columns
          .map((c) => {
            const cell = r.cells[c.id];
            if (!cell) return `<td bgcolor="${CELL_BG.none}"></td>`;
            const text = [
              `${cell.machineName} (${cell.machineCode})`,
              cell.processName,
              cell.state === "done"
                ? `ПРОЙДЕНО${cell.operator ? ` · оператор ${cell.operator}` : ""}${cell.otk ? ` · ОТК ${cell.otk}` : ""}`
                : cell.state === "current"
                  ? "В РАБОТЕ"
                  : "план",
              `${cell.hours} ч`,
              cell.arrivedAt ? `Вход: ${fmtClock(cell.arrivedAt)}` : "",
              cell.finishedAt ? `Выход: ${fmtClock(cell.finishedAt)}` : "",
              cell.factHours !== undefined ? `Факт: ${formatHours(Math.round(cell.factHours * 100) / 100)}` : "",
              cell.idleHours !== undefined && cell.idleHours > IDLE_THRESHOLD_H
                ? `ПРОСТОЙ: ${formatHours(Math.round(cell.idleHours * 100) / 100)}`
                : "",
              ...(cell.state === "done"
                ? [
                    `Мастер смены: ${cell.actualMasterShift || "—"}`,
                    `Нач. участка: ${cell.actualSectionChief || "—"}`,
                    `Оператор: ${cell.operator || "—"}`,
                    `ОТК: ${cell.otk || "—"}`,
                  ]
                : [
                    `план · Мастер смены: ${cell.masterShift || "—"}`,
                    `план · Нач. участка: ${cell.sectionChief || "—"}`,
                    `план · Оператор: ${cell.assignedOperator || "—"}`,
                  ]),
            ]
              .filter(Boolean)
              .join("\n");
            return `<td bgcolor="${CELL_BG[cell.state]}" style="mso-number-format:'\\@';vertical-align:top">${esc(text).replace(/\n/g, "<br/>")}</td>`;
          })
          .join("");
        return `<tr>${base}${cells}</tr>`;
      })
      .join("");

    const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body>
<table border="1" cellspacing="0"><tr><th colspan="${head.length}">План-задание на ${date}</th></tr>
<tr>${head.map((h) => `<th bgcolor="#DDE5EE">${esc(h)}</th>`).join("")}</tr>${body}</table>
<table border="1" cellspacing="0"><tr><td bgcolor="${CELL_BG.done}">Жёлтый — передел пройден (факт)</td><td bgcolor="${CELL_BG.current}">Светлый — в процессе</td><td bgcolor="${CELL_BG.planned}">Белый — ещё не запущен</td><td bgcolor="${CELL_BG.none}">Серый — не входит в маршрут</td></tr></table>
</body></html>`;

    const blob = new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `План-задание_${date.replace(/\./g, "-")}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("План-задание выгружено в Excel");
  };

  const printRouteCard = () => {
    const style = document.createElement("style");
    style.id = "plan-print-landscape";
    style.textContent = "@media print { @page { size: A4 landscape; margin: 10mm; } }";
    document.head.appendChild(style);
    const cleanup = () => style.remove();
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
  };

  return (
    <Protected>
      <AppShell
        title="План-задание цехам"
        subtitle={`${filtered.length} позиций · ${columns.length} технологических переделов · на ${date}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={printRouteCard}>
              <Printer className="size-4" /> Печать
            </Button>
            <Button size="sm" onClick={exportExcel}>
              <Download className="size-4" /> Выгрузить в Excel
            </Button>
          </div>
        }
      >
        <div className="mb-3 hidden border-b-2 border-foreground pb-2 print:block">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            ОАО «Ташкентский кабельный завод»
          </p>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-lg font-bold uppercase">Маршрутная карта — план-задание цехам</h2>
            <span className="text-xs">
              Дата: {date} · {filtered.length} позиций
            </span>
          </div>
        </div>

        <div className="no-print panel mb-4 flex flex-wrap items-center gap-3 p-4">
          <Input
            className="max-w-xs"
            placeholder="Поиск по заказу, заказчику, марке"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Legend color={CELL_BG.done} label="передел пройден (факт)" />
          <Legend color={CELL_BG.current} label="в процессе" />
          <Legend color={CELL_BG.planned} label="не запущен" />
          <Legend color={CELL_BG.none} label="не входит в маршрут" />
        </div>

        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-[11px]">
            <thead>
              <tr className="bg-muted">
                <Th>№</Th>
                <Th>Заказ</Th>
                <Th>Марка · сечение</Th>
                <Th className="text-right">Метраж</Th>
                <Th>Вид выпуска</Th>
                <Th className="text-right">Норма</Th>
                {columns.map((c) => (
                  <Th key={c.id} className="min-w-[160px]">
                    {c.short}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <PlanRowView
                  key={`${r.orderId}-${r.itemId}`}
                  row={r}
                  index={i}
                  columns={columns}
                  onAssign={setStepAssignment}
                />
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6 + columns.length} className="p-8 text-center text-muted-foreground">
                    <Table2 className="mx-auto mb-2 size-6" /> Нет заказов — создайте заказ в разделе «Заказы»
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AppShell>
    </Protected>
  );
}

function PlanRowView({
  row,
  index,
  columns,
  onAssign,
}: {
  row: PlanRow;
  index: number;
  columns: typeof PLAN_COLUMNS;
  onAssign: (orderId: string, itemId: string, processId: string, patch: { masterShift?: string; sectionChief?: string; operator?: string }) => void;
}) {
  return (
    <tr className="align-top">
      <Td className="font-mono">{index + 1}</Td>
      <Td>
        <span className="block font-mono font-semibold">{row.orderNumber}</span>
        <Badge variant="outline" className="mt-1 text-[9px]">
          {row.status}
        </Badge>
      </Td>
      <Td>
        <span className="block font-medium">{row.model}</span>
        <span className="text-muted-foreground">{row.size}</span>
      </Td>
      <Td className="text-right tabular-nums">{formatNum(row.lengthM)} м</Td>
      <Td>{row.readiness}</Td>
      <Td className="text-right tabular-nums">{formatHours(row.hours)}</Td>
      {columns.map((c) => {
        const cell = row.cells[c.id];
        return (
          <td
            key={c.id}
            className="border border-border p-1.5 text-[10px] leading-tight text-neutral-900"
            style={{ backgroundColor: cell ? CELL_BG[cell.state] : CELL_BG.none }}
          >
            {cell ? (
              <>
                <span className="block font-semibold">{cell.machineCode}</span>
                <span className="block">{cell.machineName}</span>
                <span className="block opacity-70">{cell.processName}</span>
                <span className="block font-medium">
                  {cell.state === "done"
                    ? `пройдено${cell.operator ? ` · ${cell.operator}` : ""}`
                    : cell.state === "current"
                      ? "в работе"
                      : "план"}
                </span>
                {(cell.arrivedAt || cell.finishedAt) && (
                  <div className="mt-1 space-y-0.5 text-muted-foreground">
                    {cell.arrivedAt && <span className="block">вход {fmtClock(cell.arrivedAt)}</span>}
                    {cell.finishedAt && <span className="block">выход {fmtClock(cell.finishedAt)}</span>}
                    {cell.factHours !== undefined && (
                      <span className="block">факт {formatHours(Math.round(cell.factHours * 100) / 100)}</span>
                    )}
                    {cell.idleHours !== undefined && cell.idleHours > IDLE_THRESHOLD_H && (
                      <span className="block font-semibold text-warning">
                        простой {formatHours(Math.round(cell.idleHours * 100) / 100)}
                      </span>
                    )}
                  </div>
                )}
                {cell.state === "done" ? (
                  <div className="mt-1 space-y-1 border-t border-neutral-400/50 pt-1">
                    {(
                      [
                        ["Мастер смены", cell.actualMasterShift],
                        ["Нач. участка", cell.actualSectionChief],
                        ["Оператор", cell.operator],
                        ["ОТК", cell.otk],
                      ] as const
                    ).map(([label, name]) => (
                      <div key={label} className="flex items-center gap-1">
                        <span className="shrink-0 opacity-70">{label}:</span>
                        <span className="min-w-0 flex-1 truncate font-medium">{name || "—"}</span>
                        <span
                          className="h-3 w-5 shrink-0 border-b border-dotted border-neutral-500 print:h-5 print:w-16"
                          title="подпись"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-print mt-1 space-y-0.5">
                    {(
                      [
                        ["masterShift", "Мастер смены" as const],
                        ["sectionChief", "Нач. участка" as const],
                        ["operator", "Оператор" as const],
                      ] as const
                    ).map(([field, role]) => (
                      <NameSelect
                        key={field}
                        role={role}
                        value={field === "operator" ? cell.assignedOperator : cell[field]}
                        onChange={(name) => onAssign(row.orderId, row.itemId, c.id, { [field]: name })}
                        className="h-6 w-full px-1.5 text-[9px]"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </td>
        );
      })}
    </tr>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="size-4 rounded-sm border border-border" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`border border-border p-1.5 text-left font-semibold ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`border border-border p-1.5 ${className}`}>{children}</td>;
}
