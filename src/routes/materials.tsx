import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Badge } from "@/components/ui/badge";
import { MATERIALS } from "@/lib/data/catalog";
import { Truck, Scale } from "lucide-react";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Материалы — CTMS кабельный завод" },
      {
        name: "description",
        content: "Справочник сырья и материалов кабельного производства: медь, ПВХ, СПЭ, фольга, стальная лента.",
      },
      { property: "og:title", content: "Материалы — CTMS" },
      { property: "og:description", content: "Сырьё и материалы кабельного завода с плотностью и поставщиками." },
    ],
  }),
  component: MaterialsPage,
});

function MaterialsPage() {
  return (
    <Protected>
      <AppShell title="Материалы" subtitle={`${MATERIALS.length} позиций сырья и вспомогательных материалов`}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MATERIALS.map((m, i) => (
            <article
              key={m.id}
              className="panel animate-rise p-5 transition-transform hover:-translate-y-1"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-w-0 font-display text-base font-semibold">{m.name}</h3>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {m.type}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
              <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs">
                <p className="font-semibold uppercase tracking-widest text-muted-foreground">Применение</p>
                <p className="mt-1">{m.usage}</p>
              </div>
              <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <dt className="inline-flex items-center gap-1 text-muted-foreground">
                    <Scale className="size-3" /> Плотность
                  </dt>
                  <dd className="font-mono font-medium">{m.density} г/см³</dd>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <dt className="inline-flex shrink-0 items-center gap-1 text-muted-foreground">
                    <Truck className="size-3" /> Поставщик
                  </dt>
                  <dd className="text-right font-medium">{m.supplier}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </AppShell>
    </Protected>
  );
}
