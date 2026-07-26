import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatNum } from "@/lib/calc";

const rows = (p: Product): Array<[string, string]> => [
  ["Наименование", p.name],
  ["Артикул", p.article],
  ["Номинальное напряжение", p.voltage],
  ["Число жил", String(p.cores)],
  ["Номинальное сечение", `${formatNum(p.section, 2)} мм²`],
  ["Токопроводящая жила", p.conductor],
  ["Изоляция", p.insulation],
  ["Экран", p.screen],
  ["Броня", p.armor],
  ["Наружная оболочка", p.jacket],
  ["Наружный диаметр", `${formatNum(p.outerDiameter, 1)} мм`],
  ["Расчётная масса", `${formatNum(p.weightKgPerKm)} кг/км`],
  ["Радиус изгиба", p.bendRadius],
  ["Температурный диапазон", p.temperature],
  ["Применяемый ГОСТ", p.gost],
  ["Применяемые ТУ", p.tu],
];

export function ProductSpec({ product }: { product: Product }) {
  return (
    <div className="panel overflow-hidden">
      <div className="industrial-gradient px-5 py-4 text-primary-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-semibold uppercase">{product.name}</h2>
          <Badge className="bg-accent text-accent-foreground hover:bg-accent">{product.voltage}</Badge>
        </div>
        <p className="mt-1 max-w-3xl text-sm opacity-85">{product.description}</p>
      </div>
      <dl className="grid gap-px bg-border sm:grid-cols-2">
        {rows(product).map(([k, v]) => (
          <div key={k} className="bg-card px-5 py-3">
            <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">{k}</dt>
            <dd className="mt-0.5 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-border bg-muted/40 px-5 py-4">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Примечания</p>
        <p className="mt-1 text-sm">{product.notes}</p>
      </div>
    </div>
  );
}
