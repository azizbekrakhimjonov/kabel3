import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MACHINES, PROCESSES } from "@/lib/data/catalog";
import { Cog, Gauge, Zap, Search, Calendar } from "lucide-react";
import type { MachineStatus } from "@/lib/types";

export const Route = createFileRoute("/machines")({
  head: () => ({
    meta: [
      { title: "Оборудование — CTMS кабельный завод" },
      {
        name: "description",
        content: "Парк оборудования кабельного завода: станы волочения, экструдеры, крутильные и упаковочные линии.",
      },
      { property: "og:title", content: "Оборудование — CTMS" },
      { property: "og:description", content: "Состояние и характеристики производственного оборудования." },
    ],
  }),
  component: MachinesPage,
});

const statusTone: Record<MachineStatus, string> = {
  работает: "bg-success/15 text-success border-success/30",
  простой: "bg-muted text-muted-foreground border-border",
  ремонт: "bg-destructive/15 text-destructive border-destructive/30",
  наладка: "bg-warning/20 text-warning border-warning/40",
};

function MachinesPage() {
  const [q, setQ] = useState("");
  const list = MACHINES.filter(
    (m) =>
      m.name.toLowerCase().includes(q.toLowerCase()) ||
      m.code.toLowerCase().includes(q.toLowerCase()) ||
      m.workshop.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Protected>
      <AppShell
        title="Оборудование"
        subtitle={`${MACHINES.length} единиц · ${MACHINES.filter((m) => m.status === "работает").length} в работе`}
      >
        <div className="panel mb-4 p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, коду или цеху"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((m, i) => (
            <article
              key={m.id}
              className="panel animate-rise overflow-hidden transition-transform hover:-translate-y-1"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div className="grid-blueprint relative grid h-28 place-items-center bg-muted/60">
                <Cog className="size-10 text-muted-foreground/50" />
                <Badge className={`absolute right-3 top-3 border ${statusTone[m.status]}`} variant="outline">
                  {m.status}
                </Badge>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="min-w-0 font-display text-base font-semibold">{m.name}</h3>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{m.code}</span>
                </div>
                <p className="mt-1 text-xs text-accent">{m.workshop}</p>
                <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                  <div>
                    <dt className="inline-flex items-center gap-1 text-muted-foreground">
                      <Gauge className="size-3" /> Мощн.
                    </dt>
                    <dd className="font-medium">{m.capacity}</dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-1 text-muted-foreground">
                      <Zap className="size-3" /> Привод
                    </dt>
                    <dd className="font-medium">{m.power}</dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-1 text-muted-foreground">
                      <Calendar className="size-3" /> Год
                    </dt>
                    <dd className="font-medium">{m.year}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-1">
                  {m.operationIds.map((op) => (
                    <Badge key={op} variant="secondary" className="text-[10px]">
                      {PROCESSES.find((p) => p.id === op)?.shortName}
                    </Badge>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </AppShell>
    </Protected>
  );
}
