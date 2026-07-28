import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search as SearchIcon, Star, Printer, ClipboardList } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { ProductSpec } from "@/components/ProductSpec";
import { RouteTimeline } from "@/components/RouteTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUCTS, CABLE_MODELS } from "@/lib/data/products";
import { STANDARDS } from "@/lib/data/catalog";
import { useApp } from "@/lib/store";
import { calcItem, formatNum } from "@/lib/calc";
import { toast } from "sonner";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    model: typeof s.model === "string" ? s.model : "",
    size: typeof s.size === "string" ? s.size : "",
  }),
  head: () => ({
    meta: [
      { title: "Поиск продукции — CTMS кабельный завод" },
      {
        name: "description",
        content: "Поиск кабеля по марке и сечению с полной технологической картой, маршрутом и стандартами.",
      },
      { property: "og:title", content: "Поиск продукции — CTMS" },
      { property: "og:description", content: "Марка и размер кабеля — полная технологическая информация." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const initial = Route.useSearch();
  const navigate = Route.useNavigate();
  const { pushRecent, favorites, toggleFavorite } = useApp();
  const [model, setModel] = useState(initial.model);
  const [size, setSize] = useState(initial.size);
  const [query, setQuery] = useState<{ model: string; size: string } | null>(
    initial.model ? { model: initial.model, size: initial.size } : null,
  );

  const modelHints = useMemo(
    () => CABLE_MODELS.filter((m) => m.toLowerCase().includes(model.toLowerCase())).slice(0, 6),
    [model],
  );
  const sizeHints = useMemo(
    () =>
      Array.from(
        new Set(
          PRODUCTS.filter((p) => (model ? p.model.toLowerCase().includes(model.toLowerCase()) : true))
            .map((p) => p.size)
            .filter((s) => s.includes(size.replace(",", ".").replace("х", "x"))),
        ),
      ).slice(0, 8),
    [model, size],
  );

  const results = useMemo(() => {
    if (!query) return [];
    const m = query.model.trim().toLowerCase();
    const s = query.size.trim().toLowerCase().replace(",", ".").replace("х", "x");
    return PRODUCTS.filter(
      (p) => (!m || p.model.toLowerCase().includes(m)) && (!s || p.size.toLowerCase() === s || p.size.includes(s)),
    );
  }, [query]);

  const product = results[0];
  const calc = product ? calcItem({ id: "preview", productId: product.id, lengthM: 1000, drums: 0 }) : null;

  return (
    <Protected>
      <AppShell title="Поиск продукции" subtitle="Введите марку и сечение кабеля">
        <form
          className="panel animate-rise p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (!model.trim() && !size.trim()) {
              toast.error("Укажите марку или сечение кабеля");
              return;
            }
            setQuery({ model, size });
            pushRecent(model || "—", size || "—");
            navigate({ to: ".", search: { model, size } });
          }}
        >
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="model">Марка кабеля</Label>
              <Input
                id="model"
                list="model-list"
                placeholder="Например: КВВГЭнг(А)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="h-12 font-mono text-base"
              />
              <datalist id="model-list">
                {modelHints.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Сечение</Label>
              <Input
                id="size"
                list="size-list"
                placeholder="Например: 10x1.5"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="h-12 font-mono text-base"
              />
              <datalist id="size-list">
                {sizeHints.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <Button type="submit" size="lg" className="h-12 md:px-8">
              <SearchIcon className="size-4" /> Найти
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Популярные запросы:</span>
            {[
              ["КВВГЭнг(А)", "10x1.5"],
              ["ВВГнг(А)-LS", "4x6"],
              ["ВБбШв", "4x16"],
              ["АВВГ", "4x50"],
            ].map(([m, s]) => (
              <button
                key={m + s}
                type="button"
                className="rounded-full border border-border px-3 py-1 text-xs transition hover:border-accent hover:text-accent"
                onClick={() => {
                  setModel(m);
                  setSize(s);
                  setQuery({ model: m, size: s });
                  pushRecent(m, s);
                }}
              >
                {m} {s}
              </button>
            ))}
          </div>
        </form>

        {query && results.length === 0 && (
          <div className="panel mt-6 p-8 text-center">
            <p className="font-display text-lg uppercase">Ничего не найдено</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Проверьте марку и сечение либо выберите позицию в каталоге продукции.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/products">Открыть каталог</Link>
            </Button>
          </div>
        )}

        {product && calc && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Найдено позиций: {results.length}</Badge>
              {results.slice(0, 6).map((r) => (
                <button
                  key={r.id}
                  onClick={() => setQuery({ model: r.model, size: r.size })}
                  className={`rounded-md border px-3 py-1 text-xs transition ${
                    r.id === product.id ? "border-accent bg-accent/10 text-accent" : "border-border"
                  }`}
                >
                  {r.name}
                </button>
              ))}
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleFavorite(product.id)}>
                  <Star className={`size-4 ${favorites.includes(product.id) ? "fill-accent text-accent" : ""}`} />
                  В избранное
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/reports" search={{ productId: product.id }}>
                    <Printer className="size-4" /> Маршрутная карта
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/orders" search={{ productId: product.id }}>
                    <ClipboardList className="size-4" /> В заказ
                  </Link>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="spec">
              <TabsList>
                <TabsTrigger value="spec">Техническая карта</TabsTrigger>
                <TabsTrigger value="route">Маршрут производства</TabsTrigger>
                <TabsTrigger value="calc">Расчёт на 1000 м</TabsTrigger>
                <TabsTrigger value="std">Стандарты</TabsTrigger>
              </TabsList>
              <TabsContent value="spec" className="mt-4">
                <ProductSpec product={product} />
              </TabsContent>
              <TabsContent value="route" className="mt-4">
                <RouteTimeline product={product} />
              </TabsContent>
              <TabsContent value="calc" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Cell label="Масса" value={`${formatNum(calc.weightKg)} кг`} />
                  <Cell label="Медь / алюминий" value={`${formatNum(calc.copperKg, 1)} кг`} />
                  <Cell label="ПВХ-пластикат" value={`${formatNum(calc.pvcKg, 1)} кг`} />
                  <Cell label="Время производства" value={`${formatNum(calc.productionHours, 1)} ч`} />
                  <Cell label="Экран" value={`${formatNum(calc.screenKg, 1)} кг`} />
                  <Cell label="Броня" value={`${formatNum(calc.armorKg, 1)} кг`} />
                </div>
              </TabsContent>
              <TabsContent value="std" className="mt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {STANDARDS.filter((s) => s.number === product.gost || s.number === product.tu || s.products.some((p) => product.model.startsWith(p))).map(
                    (s) => (
                      <div key={s.id} className="panel p-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={s.type === "ГОСТ" ? "default" : "secondary"}>{s.type}</Badge>
                          <p className="font-mono text-sm font-semibold">{s.number}</p>
                        </div>
                        <p className="mt-2 text-sm font-medium">{s.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                      </div>
                    ),
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </AppShell>
    </Protected>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
