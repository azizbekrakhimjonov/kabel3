import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { RouteTimeline } from "@/components/RouteTimeline";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS, ROUTES } from "@/lib/data/products";
import { formatNum } from "@/lib/calc";
import { GitBranch, Search } from "lucide-react";

export const Route = createFileRoute("/routes")({
  head: () => ({
    meta: [
      { title: "Маршрутные карты — CTMS кабельный завод" },
      {
        name: "description",
        content: "Технологические маршруты производства кабеля: переходы, оборудование и нормы времени.",
      },
      { property: "og:title", content: "Маршрутные карты — CTMS" },
      { property: "og:description", content: "Полный перечень производственных маршрутов кабельного завода." },
    ],
  }),
  component: RoutesPage,
});

function RoutesPage() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(PRODUCTS[0].id);
  const product = PRODUCTS.find((p) => p.id === selected)!;
  const list = ROUTES.filter((r) => {
    const p = PRODUCTS.find((x) => x.id === r.productId)!;
    return p.name.toLowerCase().includes(q.toLowerCase()) || r.code.toLowerCase().includes(q.toLowerCase());
  });

  return (
    <Protected>
      <AppShell
        title="Маршрутные карты"
        subtitle={`${ROUTES.length} маршрутов · ${ROUTES.reduce((a, r) => a + r.steps.length, 0)} технологических переходов`}
      >
        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="panel flex max-h-[70vh] flex-col overflow-hidden">
            <div className="border-b border-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск маршрута"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto">
              {list.map((r) => {
                const p = PRODUCTS.find((x) => x.id === r.productId)!;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelected(p.id)}
                      className={`flex w-full flex-col items-start gap-1 border-b border-border px-4 py-3 text-left transition hover:bg-muted/60 ${
                        selected === p.id ? "bg-accent/10" : ""
                      }`}
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{p.name}</span>
                        <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                          {r.code}
                        </Badge>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {r.steps.length} переходов · {formatNum(r.totalHoursPer1000m, 1)} ч / 1000 м
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="panel mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 font-display text-lg font-semibold uppercase">
                  <GitBranch className="size-4 text-accent" /> {product.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Маршрут {ROUTES.find((r) => r.productId === product.id)!.code} · норма времени{" "}
                  {formatNum(ROUTES.find((r) => r.productId === product.id)!.totalHoursPer1000m, 1)} ч на 1000 м
                </p>
              </div>
              <Link
                to="/products/$productId"
                params={{ productId: product.id }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Карта изделия →
              </Link>
            </div>
            <RouteTimeline product={product} />
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
