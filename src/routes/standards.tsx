import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { STANDARDS } from "@/lib/data/catalog";
import { BookMarked, Search } from "lucide-react";

export const Route = createFileRoute("/standards")({
  head: () => ({
    meta: [
      { title: "Стандарты ГОСТ и ТУ — CTMS кабельный завод" },
      {
        name: "description",
        content: "Нормативная база кабельного производства: действующие ГОСТ и технические условия.",
      },
      { property: "og:title", content: "Стандарты ГОСТ и ТУ — CTMS" },
      { property: "og:description", content: "Действующие ГОСТ и ТУ, применяемые к продукции завода." },
    ],
  }),
  component: StandardsPage,
});

function StandardsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const list = STANDARDS.filter(
    (s) =>
      (type === "all" || s.type === type) &&
      (s.number.toLowerCase().includes(q.toLowerCase()) ||
        s.title.toLowerCase().includes(q.toLowerCase()) ||
        s.products.join(" ").toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <Protected>
      <AppShell title="Стандарты ГОСТ / ТУ" subtitle={`${STANDARDS.length} действующих документов`}>
        <div className="panel mb-4 flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по номеру, названию или марке"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={type} onValueChange={setType}>
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="ГОСТ">ГОСТ</TabsTrigger>
              <TabsTrigger value="ТУ">ТУ</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {list.map((s, i) => (
            <article
              key={s.id}
              className="panel animate-rise p-5 transition-transform hover:-translate-y-1"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-2">
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <BookMarked className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold">{s.number}</p>
                  <p className="text-[11px] text-muted-foreground">Год введения: {s.year}</p>
                </div>
                <Badge variant={s.type === "ГОСТ" ? "default" : "secondary"} className="ml-auto shrink-0">
                  {s.type}
                </Badge>
              </div>
              <h3 className="mt-3 font-display text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-3 flex flex-wrap gap-1 border-t border-border pt-3">
                {s.products.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px]">
                    {p}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </AppShell>
    </Protected>
  );
}
