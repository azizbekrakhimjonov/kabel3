import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { ProductSpec } from "@/components/ProductSpec";
import { RouteTimeline } from "@/components/RouteTimeline";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRODUCTS } from "@/lib/data/products";
import { calcItem, formatNum, formatSum } from "@/lib/calc";
import { ClipboardList, Printer, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/products/$productId")({
  head: () => ({
    meta: [
      { title: "Карта изделия — CTMS кабельный завод" },
      {
        name: "description",
        content: "Технологическая карта кабельного изделия: конструкция, маршрут, материалы и стандарты.",
      },
      { property: "og:title", content: "Карта изделия — CTMS" },
      { property: "og:description", content: "Конструкция, маршрут производства и нормы расхода материалов." },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) throw notFound();
  const calc = calcItem({ id: "preview", productId: product.id, lengthM: 1000, drums: 0 })!;

  return (
    <Protected>
      <AppShell title={product.name} subtitle={`Артикул ${product.article}`}>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/products">
              <ArrowLeft className="size-4" /> К каталогу
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/reports" search={{ productId: product.id }}>
              <Printer className="size-4" /> Маршрутная карта
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/orders" search={{ productId: product.id }}>
              <ClipboardList className="size-4" /> Добавить в заказ
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="spec">
          <TabsList>
            <TabsTrigger value="spec">Техническая карта</TabsTrigger>
            <TabsTrigger value="route">Маршрут</TabsTrigger>
            <TabsTrigger value="norms">Нормы на 1000 м</TabsTrigger>
          </TabsList>
          <TabsContent value="spec" className="mt-4">
            <ProductSpec product={product} />
          </TabsContent>
          <TabsContent value="route" className="mt-4">
            <RouteTimeline product={product} />
          </TabsContent>
          <TabsContent value="norms" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Масса кабеля", `${formatNum(calc.weightKg)} кг`],
                [product.conductorMaterial, `${formatNum(calc.copperKg, 1)} кг`],
                ["ПВХ-пластикат", `${formatNum(calc.pvcKg, 1)} кг`],
                ["Экран", `${formatNum(calc.screenKg, 1)} кг`],
                ["Стальная лента", `${formatNum(calc.armorKg, 1)} кг`],
                ["Барабанов", `${calc.drums} шт по ${calc.drumLength} м`],
                ["Время производства", `${formatNum(calc.productionHours, 1)} ч`],
                ["Материалы", formatSum(calc.materialCost)],
              ].map(([l, v]) => (
                <div key={l} className="panel p-4">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{l}</p>
                  <p className="mt-1 font-display text-xl font-semibold tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </AppShell>
    </Protected>
  );
}
