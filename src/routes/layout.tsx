import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Badge } from "@/components/ui/badge";
import { MACHINES, PROCESSES, WORKSHOPS } from "@/lib/data/catalog";
import { ArrowDown, ArrowRight, Cog } from "lucide-react";

export const Route = createFileRoute("/layout")({
  head: () => ({
    meta: [
      { title: "Схема завода — CTMS кабельный завод" },
      {
        name: "description",
        content: "Схема производственных цехов кабельного завода и материальный поток от волочения до склада.",
      },
      { property: "og:title", content: "Схема завода — CTMS" },
      { property: "og:description", content: "Планировка цехов и движение продукции по переделам." },
    ],
  }),
  component: LayoutPage,
});

function LayoutPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Protected>
      <AppShell title="Схема завода" subtitle="Планировка цехов и материальный поток производства">
        <div className="panel grid-blueprint p-6">
          <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-stretch">
            {WORKSHOPS.map((w, i) => {
              const machines = MACHINES.filter((m) => m.workshop === w);
              const procs = PROCESSES.filter((p) => p.workshop === w);
              const isActive = active === w;
              return (
                <div key={w} className="flex flex-1 items-center gap-4 lg:flex-col">
                  <button
                    type="button"
                    onClick={() => setActive(isActive ? null : w)}
                    className={`panel w-full flex-1 p-4 text-left transition ${
                      isActive ? "ring-2 ring-accent" : "hover:-translate-y-1"
                    }`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                      Передел {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 font-display text-sm font-semibold uppercase">{w}</h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {machines.length} ед. оборудования · {procs.length} операц.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {machines.slice(0, 4).map((m) => (
                        <span
                          key={m.id}
                          className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] ${
                            m.status === "работает"
                              ? "border-success/40 bg-success/10 text-success"
                              : m.status === "ремонт"
                                ? "border-destructive/40 bg-destructive/10 text-destructive"
                                : "border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          <Cog className="size-2.5" />
                          {m.code}
                        </span>
                      ))}
                      {machines.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">+{machines.length - 4}</span>
                      )}
                    </div>
                  </button>
                  {i < WORKSHOPS.length - 1 && (
                    <div className="shrink-0 text-accent">
                      <ArrowDown className="size-5 lg:hidden" />
                      <ArrowRight className="hidden size-5 animate-pulse lg:block" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {active && (
          <div className="panel animate-rise mt-6 p-5">
            <h2 className="font-display text-lg font-semibold uppercase">{active}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Технологические операции
                </p>
                <ul className="mt-2 space-y-2">
                  {PROCESSES.filter((p) => p.workshop === active).map((p) => (
                    <li key={p.id} className="rounded-md border border-border p-3">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                      <p className="mt-1 font-mono text-[11px] text-accent">
                        {p.params.speed} · {p.params.temperature}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Оборудование участка
                </p>
                <ul className="mt-2 space-y-2">
                  {MACHINES.filter((m) => m.workshop === active).map((m) => (
                    <li key={m.id} className="flex items-center gap-3 rounded-md border border-border p-3">
                      <div className="grid size-8 shrink-0 place-items-center rounded-md bg-muted">
                        <Cog className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{m.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {m.code} · {m.capacity}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {m.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </Protected>
  );
}
