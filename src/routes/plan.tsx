import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

function PlanPage() {
  const { orders, setAssignment } = useApp();
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
      "Мастер смены",
      "Начальник участка",
      "Оператор",
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
          r.masterShift,
          r.sectionChief,
          r.operator,
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
            ].join("\n");
            return `<td bgcolor="${CELL_BG[cell.state]}" style="mso-number-format:'\\@';vertical-align:top">${esc(text).replace(/\n/g, "<br/>")}</td>`;
          })
          .join("");
        return `<tr>${base}${cells}</tr>`;
      })
      .join("");

    const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body>
<table border="1" cellspacing="0"><tr><th colspan="${head.length}">План-задание на ${date}</th></tr>
<tr>${head.map((h) => `<th bgcolor="#DDE5EE">${esc(h)}</th>`).join("")}</tr>${body}</table>
<table border="1" cellspacing="0"><tr><td bgcolor="${CELL_BG.done}">жёлтый — передел пройден</td><td bgcolor="${CELL_BG.current}">светлый — в работе сейчас</td><td bgcolor="${CELL_BG.planned}">белый — ещё не запущен</td><td bgcolor="${CELL_BG.none}">серый — не входит в маршрут</td></tr></table>
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

  return (
    <Protected>
      <AppShell
        title="План-задание цехам"
        subtitle={`${filtered.length} позиций · ${columns.length} технологических переделов · на ${date}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> Печать
            </Button>
            <Button size="sm" onClick={exportExcel}>
              <Download className="size-4" /> Выгрузить в Excel
            </Button>
          </div>
        }
      >
        <div className="no-print panel mb-4 flex flex-wrap items-center gap-3 p-4">
          <Input
            className="max-w-xs"
            placeholder="Поиск по заказу, заказчику, марке"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Legend color={CELL_BG.done} label="передел пройден" />
          <Legend color={CELL_BG.current} label="в работе" />
          <Legend color={CELL_BG.planned} label="не запущен" />
          <Legend color={CELL_BG.none} label="не входит в маршрут" />
        </div>

        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-[11px]">
            <thead>
              <tr className="bg-muted">
                <Th>№</Th>
                <Th>Заказ / заказчик</Th>
                <Th>Марка · сечение</Th>
                <Th className="text-right">Метраж</Th>
                <Th>Вид выпуска</Th>
                <Th className="text-right">Норма</Th>
                <Th>Мастер смены</Th>
                <Th>Нач. участка</Th>
                <Th>Оператор</Th>
                {columns.map((c) => (
                  <Th key={c.id} className="min-w-[120px]">
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
                  onAssign={setAssignment}
                />
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={9 + columns.length} className="p-8 text-center text-muted-foreground">
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
  onAssign: (orderId: string, itemId: string, patch: { masterShift?: string; sectionChief?: string; operator?: string }) => void;
}) {
  return (
    <tr className="align-top">
      <Td className="font-mono">{index + 1}</Td>
      <Td>
        <span className="block font-mono font-semibold">{row.orderNumber}</span>
        <span className="block max-w-[220px] truncate text-muted-foreground">{row.customer}</span>
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
      {(["masterShift", "sectionChief", "operator"] as const).map((field) => (
        <Td key={field}>
          <Input
            value={row[field]}
            placeholder="Ф.И.О."
            onChange={(e) => onAssign(row.orderId, row.itemId, { [field]: e.target.value })}
            className="h-7 w-28 text-[11px]"
          />
        </Td>
      ))}
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
