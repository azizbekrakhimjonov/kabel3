import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/KpiCard";
import { useApp } from "@/lib/store";
import { buildPlanRows, PLAN_COLUMNS } from "@/lib/plan";
import { formatHours } from "@/lib/calc";
import { WEEKDAY_LABELS, currentShift, durationShort, sameDay, shiftNumberFor, weekDays } from "@/lib/shift";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Factory, Timer } from "lucide-react";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Календарь — CTMS кабельный завод" },
      {
        name: "description",
        content: "Недельный календарь: сроки заказов, смены и фактическая загрузка цехов по дням.",
      },
    ],
  }),
  component: CalendarPage,
});

const fmtDay = (d: Date) => d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });

function useTick(intervalMs: number) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
}

function CalendarPage() {
  const { orders } = useApp();
  const [weekOffset, setWeekOffset] = useState(0);
  useTick(1000);

  const days = useMemo(() => weekDays(weekOffset), [weekOffset]);
  const today = new Date();
  const shift = currentShift();

  const rows = useMemo(() => buildPlanRows(orders), [orders]);
  const workshopById = useMemo(() => new Map(PLAN_COLUMNS.map((c) => [c.id, c.workshop])), []);

  type Event = { orderNumber: string; processName: string; workshop: string; finishedAt: string; idleHours?: number; factHours?: number };
  const events = useMemo(() => {
    const list: Event[] = [];
    for (const row of rows) {
      for (const col of PLAN_COLUMNS) {
        const cell = row.cells[col.id];
        if (cell?.state === "done" && cell.finishedAt) {
          list.push({
            orderNumber: row.orderNumber,
            processName: cell.processName,
            workshop: workshopById.get(col.id) ?? col.workshop,
            finishedAt: cell.finishedAt,
            idleHours: cell.idleHours,
            factHours: cell.factHours,
          });
        }
      }
    }
    return list;
  }, [rows, workshopById]);

  const activeWorkshops = useMemo(() => {
    const workshops = new Set<string>();
    for (const row of rows) {
      for (const col of PLAN_COLUMNS) {
        if (row.cells[col.id]?.state === "current") workshops.add(col.workshop);
      }
    }
    return workshops.size;
  }, [rows]);

  const weekEvents = events.filter((e) => days.some((d) => sameDay(d, new Date(e.finishedAt))));
  const weekFactHours = weekEvents.reduce((a, e) => a + (e.factHours ?? 0), 0);
  const weekIdleHours = weekEvents.reduce((a, e) => a + (e.idleHours ?? 0), 0);

  return (
    <Protected>
      <AppShell
        title="Календарь"
        subtitle="Недельный план по сменам · сроки заказов и фактическая загрузка цехов"
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setWeekOffset((v) => v - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setWeekOffset(0)}>
              Сегодня
            </Button>
            <Button size="sm" variant="outline" onClick={() => setWeekOffset((v) => v + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      >
        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label={`Смена ${shift.number}`}
            value={durationShort(shift.remainingMs)}
            hint="до конца смены"
            icon={Timer}
            tone="accent"
          />
          <KpiCard label="Цехов в работе" value={activeWorkshops} hint="сейчас" icon={Factory} tone="primary" />
          <KpiCard
            label="Факт за неделю"
            value={formatHours(Math.round(weekFactHours * 100) / 100)}
            hint={`${weekEvents.length} операций`}
            icon={Clock}
            tone="success"
          />
          <KpiCard
            label="Простой за неделю"
            value={formatHours(Math.round(weekIdleHours * 100) / 100)}
            hint="время в очереди между переделами"
            icon={CalendarDays}
            tone="warning"
          />
        </div>

        <p className="mb-3 text-sm font-medium text-muted-foreground">
          {fmtDay(days[0])} — {fmtDay(days[6])} {days[0].getFullYear()}
        </p>

        <div className="grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-2 lg:grid-cols-7">
          {days.map((day, i) => {
            const isToday = sameDay(day, today);
            const dueOrders = orders.filter((o) => o.dueDate === day.toISOString().slice(0, 10));
            const dayEvents = events.filter((e) => sameDay(new Date(e.finishedAt), day));
            const bySh = [1, 2].map((n) => {
              const shEvents = dayEvents.filter((e) => shiftNumberFor(e.finishedAt) === n);
              return {
                number: n,
                ops: shEvents.length,
                fact: shEvents.reduce((a, e) => a + (e.factHours ?? 0), 0),
                idle: shEvents.reduce((a, e) => a + (e.idleHours ?? 0), 0),
              };
            });

            return (
              <div
                key={i}
                className={`panel flex min-w-[180px] flex-col p-3 ${isToday ? "ring-2 ring-accent" : ""}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {WEEKDAY_LABELS[i]}
                  </span>
                  <span className={`font-mono text-sm font-semibold ${isToday ? "text-accent" : ""}`}>
                    {fmtDay(day)}
                  </span>
                </div>

                {dueOrders.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {dueOrders.map((o) => (
                      <Badge key={o.id} variant="outline" className="block w-fit text-[10px]">
                        срок: {o.number}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  {bySh.map((s) => (
                    <div key={s.number} className="rounded-md border border-border/60 bg-muted/20 p-2 text-[11px]">
                      <p className="font-semibold">Смена {s.number}</p>
                      {s.ops > 0 ? (
                        <>
                          <p className="text-muted-foreground">{s.ops} операций · факт {formatHours(Math.round(s.fact * 100) / 100)}</p>
                          {s.idle > 0.02 && (
                            <p className="font-semibold text-warning">простой {formatHours(Math.round(s.idle * 100) / 100)}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">нет операций</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </AppShell>
    </Protected>
  );
}
