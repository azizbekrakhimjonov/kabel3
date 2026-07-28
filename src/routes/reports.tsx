import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCTS } from "@/lib/data/products";
import { buildSteps, calcItem, formatHours, formatNum, formatSum } from "@/lib/calc";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/reports")({
  validateSearch: (s: Record<string, unknown>) => ({
    productId: typeof s.productId === "string" ? s.productId : "",
  }),
  head: () => ({
    meta: [
      { title: "Маршрутная карта — CTMS кабельный завод" },
      {
        name: "description",
        content: "Формирование и печать маршрутной карты формата А4 с операциями, оборудованием и нормами времени.",
      },
      { property: "og:title", content: "Маршрутная карта — CTMS" },
      { property: "og:description", content: "Печатные маршрутные карты производства кабеля." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { productId } = Route.useSearch();
  const { orders, setAssignment } = useApp();
  const [id, setId] = useState(productId || PRODUCTS[0].id);
  const [lengthM, setLengthM] = useState(1000);
  const [orderNumber, setOrderNumber] = useState("ЗК-2024/0147");
  const [customer, setCustomer] = useState('АО "Узбекэнерго"');
  const [stage, setStage] = useState("full");
  const [source, setSource] = useState("manual");

  const orderOptions = useMemo(
    () =>
      orders.flatMap((o) =>
        o.items.map((it) => ({
          key: `${o.id}|${it.id}`,
          order: o,
          item: it,
          label: `${o.number} · ${PRODUCTS.find((p) => p.id === it.productId)?.name ?? it.productId}`,
        })),
      ),
    [orders],
  );
  const picked = orderOptions.find((o) => o.key === source);

  const applyOrder = (key: string) => {
    setSource(key);
    const opt = orderOptions.find((o) => o.key === key);
    if (!opt) return;
    setId(opt.item.productId);
    setLengthM(opt.item.lengthM);
    setOrderNumber(opt.order.number);
    setCustomer(opt.order.customer);
    setStage(opt.item.stageTo ? String(opt.item.stageTo) : "full");
  };

  const assignment = picked?.order.assignments?.[picked.item.id];
  const progress = picked?.order.progress ?? [];

  const stageOptions = useMemo(() => {
    const p = PRODUCTS.find((x) => x.id === id)!;
    return buildSteps(p, 1000);
  }, [id]);

  const calc = useMemo(
    () =>
      calcItem({
        id: "rep",
        productId: id,
        lengthM,
        drums: 0,
        stageTo: stage === "full" ? undefined : Number(stage),
      }),
    [id, lengthM, stage],
  );
  const product = calc?.product;


  return (
    <Protected>
      <AppShell
        title="Отчёты · Маршрутная карта"
        subtitle="Печатная форма А4 для передачи в цех"
        actions={
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="size-4" /> Печать / PDF
          </Button>
        }
      >
        <div className="no-print panel mb-6 grid gap-4 p-5 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Продукция</Label>
            <Select value={id} onValueChange={(v) => { setId(v); setStage("full"); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {PRODUCTS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="l">Метраж, м</Label>
            <Input id="l" type="number" min={1} value={lengthM} onChange={(e) => setLengthM(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="no">Номер заказа</Label>
            <Input id="no" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Степень готовности</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="full">Готовая продукция (весь маршрут)</SelectItem>
                {stageOptions.slice(0, -1).map((s, i) => (
                  <SelectItem key={s.processId} value={String(i + 1)}>
                    Полуфабрикат до «{s.processName}»
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cu">Заказчик</Label>
            <Input id="cu" value={customer} onChange={(e) => setCustomer(e.target.value)} />
          </div>
        </div>

        {calc && product && (
          <div className="print-sheet mx-auto max-w-[210mm] bg-card p-8 text-card-foreground shadow-sm ring-1 ring-border">
            <header className="flex items-start justify-between gap-4 border-b-2 border-foreground pb-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  ОАО «Ташкентский кабельный завод»
                </p>
                <h2 className="font-display text-xl font-bold uppercase">Маршрутная карта</h2>
              </div>
              <div className="text-right text-xs">
                <p>
                  Заказ: <span className="font-mono font-semibold">{orderNumber}</span>
                </p>
                <p>Дата: {new Date().toLocaleDateString("ru-RU")}</p>
                <p>Лист 1 из 1</p>
              </div>
            </header>

            <section className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              <Field k="Заказчик" v={customer} />
              <Field k="Артикул" v={product.article} />
              <Field k="Марка кабеля" v={product.model} />
              <Field k="Сечение" v={product.size} />
              <Field k="Наименование" v={product.name} />
              <Field k="Стандарт" v={`${product.gost} / ${product.tu}`} />
              <Field k="Метраж партии" v={`${formatNum(lengthM)} м`} />
              <Field k="Масса нетто" v={`${formatNum(calc.weightKg)} кг`} />
              <Field k="Наружный диаметр" v={`${product.outerDiameter} мм`} />
              <Field k="Тара" v={`${calc.drums} барабан(ов) по ${calc.drumLength} м`} />
              <Field k="Норма времени" v={formatHours(calc.productionHours)} />
              <Field k="Стоимость партии" v={formatSum(calc.price)} />
              <Field
                k="Вид выпуска"
                v={
                  calc.isSemi
                    ? `Полуфабрикат — до операции «${calc.stageName}» (${calc.stageTo} из ${calc.allSteps.length})`
                    : "Готовая продукция (полный маршрут)"
                }
              />
            </section>

            <table className="mt-5 w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-1.5 text-left">№</th>
                  <th className="border border-border p-1.5 text-left">Операция</th>
                  <th className="border border-border p-1.5 text-left">Цех</th>
                  <th className="border border-border p-1.5 text-left">Оборудование</th>
                  <th className="border border-border p-1.5 text-right">Скорость, м/ч</th>
                  <th className="border border-border p-1.5 text-right">Т наладки</th>
                  <th className="border border-border p-1.5 text-right">Т операции</th>
                  <th className="border border-border p-1.5 text-left">Оператор</th>
                  <th className="border border-border p-1.5 text-left">ОТК</th>
                </tr>
              </thead>
              <tbody>
                {calc.steps.map((s, i) => (
                  <tr key={s.processId}>
                    <td className="border border-border p-1.5 font-mono">{String(i + 1).padStart(2, "0")}</td>
                    <td className="border border-border p-1.5 font-medium">{s.processName}</td>
                    <td className="border border-border p-1.5">{s.workshop}</td>
                    <td className="border border-border p-1.5">
                      {s.machineName} ({s.machineCode})
                    </td>
                    <td className="border border-border p-1.5 text-right tabular-nums">
                      {formatNum(s.ratePerHour)}
                    </td>
                    <td className="border border-border p-1.5 text-right tabular-nums">{s.setupMinutes} мин</td>
                    <td className="border border-border p-1.5 text-right tabular-nums">
                      {formatHours(s.totalHours)}
                    </td>
                    <td className="border border-border p-1.5 h-7"></td>
                    <td className="border border-border p-1.5 h-7"></td>
                  </tr>
                ))}
                <tr className="bg-muted font-semibold">
                  <td className="border border-border p-1.5" colSpan={6}>
                    Итого норма времени на партию
                  </td>
                  <td className="border border-border p-1.5 text-right tabular-nums">
                    {formatHours(calc.productionHours)}
                  </td>
                  <td className="border border-border p-1.5"></td>
                  <td className="border border-border p-1.5"></td>
                </tr>
              </tbody>
            </table>

            <section className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wide">Норма расхода материалов</h3>
              <table className="mt-2 w-full border-collapse text-[11px]">
                <tbody>
                  <MatRow k="Проводник (медь/алюминий)" v={`${formatNum(calc.copperKg, 1)} кг`} />
                  <MatRow k="Изоляция и оболочка (ПВХ/СПЭ)" v={`${formatNum(calc.pvcKg, 1)} кг`} />
                  <MatRow k="Экран" v={`${formatNum(calc.screenKg, 1)} кг`} />
                  <MatRow k="Броня" v={`${formatNum(calc.armorKg, 1)} кг`} />
                  <MatRow k="Стоимость материалов" v={formatSum(calc.materialCost)} />
                </tbody>
              </table>
            </section>

            <footer className="mt-8 grid grid-cols-3 gap-6 text-[11px]">
              {["Технолог", "Начальник цеха", "ОТК"].map((r) => (
                <div key={r}>
                  <div className="h-8 border-b border-foreground" />
                  <p className="mt-1 text-muted-foreground">{r}</p>
                </div>
              ))}
            </footer>
          </div>
        )}
      </AppShell>
    </Protected>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2 border-b border-dotted border-border py-0.5">
      <span className="shrink-0 text-muted-foreground">{k}:</span>
      <span className="min-w-0 flex-1 font-medium">{v}</span>
    </div>
  );
}

function MatRow({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td className="border border-border p-1.5">{k}</td>
      <td className="w-40 border border-border p-1.5 text-right font-medium tabular-nums">{v}</td>
    </tr>
  );
}
