import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCTS, CABLE_MODELS } from "@/lib/data/products";
import { formatNum, formatSum } from "@/lib/calc";
import { Star, Search } from "lucide-react";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Каталог продукции — CTMS кабельный завод" },
      {
        name: "description",
        content: "Каталог кабельной продукции завода: марки, сечения, масса, стандарты и стоимость.",
      },
      { property: "og:title", content: "Каталог продукции — CTMS" },
      { property: "og:description", content: "Полный каталог кабельной продукции с технологическими данными." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { favorites, toggleFavorite } = useApp();
  const [q, setQ] = useState("");
  const [model, setModel] = useState("all");

  const rows = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (model === "all" || p.model === model) &&
          (p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.article.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, model],
  );

  return (
    <Protected>
      <AppShell title="Каталог продукции" subtitle={`${PRODUCTS.length} марко-размеров в базе`}>
        <div className="panel mb-4 grid gap-3 p-4 sm:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по наименованию или артикулу"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Марка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все марки</SelectItem>
              {CABLE_MODELS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="panel overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Наименование</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Напряжение</TableHead>
                <TableHead className="text-right">Ø, мм</TableHead>
                <TableHead className="text-right">Масса, кг/км</TableHead>
                <TableHead>Стандарт</TableHead>
                <TableHead className="text-right">Цена, м</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell>
                    <button onClick={() => toggleFavorite(p.id)} aria-label="Избранное">
                      <Star
                        className={`size-4 ${favorites.includes(p.id) ? "fill-accent text-accent" : "text-muted-foreground"}`}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.article}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.voltage}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNum(p.outerDiameter, 1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNum(p.weightKgPerKm)}</TableCell>
                  <TableCell className="text-xs">{p.gost}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatSum(p.pricePerM)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/products/$productId" params={{ productId: p.id }}>
                        Открыть
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Позиции не найдены</p>
          )}
        </div>
      </AppShell>
    </Protected>
  );
}
