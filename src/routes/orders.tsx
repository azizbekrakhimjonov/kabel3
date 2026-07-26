import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PRODUCTS, CABLE_MODELS } from "@/lib/data/products";
import { calcOrder, formatHours, formatNum, formatSum } from "@/lib/calc";
import { useApp } from "@/lib/store";
import type { Order, OrderItem } from "@/lib/types";
import { Plus, Trash2, ClipboardList, Timer, Weight, Coins, Printer, Layers } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  validateSearch: (s: Record<string, unknown>) => ({
    productId: typeof s.productId === "string" ? s.productId : "",
  }),
  head: () => ({
    meta: [
      { title: "Заказы и расчёты — CTMS кабельный завод" },
      {
        name: "description",
        content:
          "Оформление производственных заказов: метраж, расчёт материалов, времени выпуска и маршрутизации по цехам.",
      },
      { property: "og:title", content: "Заказы и расчёты — CTMS" },
      {
        property: "og:description",
        content: "Новый заказ с полным расчётом материалов, времени и маршрутов производства.",
      },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { productId } = Route.useSearch();
  const { orders, addOrder, updateOrderStatus, removeOrder } = useApp();

  const [customer, setCustomer] = useState("");
  const [manager, setManager] = useState("Р. Каримов");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  });
  const [priority, setPriority] = useState<Order["priority"]>("обычный");
  const [comment, setComment] = useState("");
  const [items, setItems] = useState<OrderItem[]>(
    productId ? [{ id: "it-1", productId, lengthM: 1000, drums: 0 }] : [],
  );

  const [model, setModel] = useState(productId ? PRODUCTS.find((p) => p.id === productId)!.model : "");
  const [size, setSize] = useState("");
  const [length, setLength] = useState(1000);

  const sizes = useMemo(() => PRODUCTS.filter((p) => p.model === model).map((p) => p.size), [model]);
  const calc = calcOrder({ items });

  const addItem = () => {
    const product = PRODUCTS.find((p) => p.model === model && p.size === size);
    if (!product) {
      toast.error("Выберите марку и сечение из номенклатуры");
      return;
    }
    if (length <= 0) {
      toast.error("Укажите метраж больше нуля");
      return;
    }
    setItems((prev) => [...prev, { id: `it-${Date.now()}`, productId: product.id, lengthM: length, drums: 0 }]);
    toast.success(`${product.name} — ${formatNum(length)} м добавлено в заказ`);
  };

  const saveOrder = () => {
    if (!customer.trim()) return toast.error("Укажите заказчика");
    if (items.length === 0) return toast.error("Добавьте хотя бы одну позицию");
    const order: Order = {
      id: `ord-${Date.now()}`,
      number: `ЗК-${new Date().getFullYear()}/${String(orders.length + 153).padStart(4, "0")}`,
      customer,
      manager,
      createdAt: new Date().toISOString().slice(0, 10),
      dueDate,
      priority,
      status: "черновик",
      comment,
      items,
    };
    addOrder(order);
    setItems([]);
    setCustomer("");
    setComment("");
    toast.success(`Заказ ${order.number} создан. Срок выпуска: ${calc.finishDate}`);
  };

  return (
    <Protected>
      <AppShell title="Заказы и расчёты" subtitle="Оформление заказа с полным технологическим расчётом">
        <Tabs defaultValue="new">
          <TabsList>
            <TabsTrigger value="new">Новый заказ</TabsTrigger>
            <TabsTrigger value="list">Реестр заказов ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-4 space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="panel space-y-4 p-5 lg:col-span-2">
                <h2 className="font-display text-lg font-semibold uppercase">Реквизиты заказа</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="customer">Заказчик</Label>
                    <Input
                      id="customer"
                      placeholder='Например: АО "Узбекэнерго"'
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manager">Ответственный менеджер</Label>
                    <Input id="manager" value={manager} onChange={(e) => setManager(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due">Срок поставки</Label>
                    <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Приоритет</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as Order["priority"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="низкий">Низкий</SelectItem>
                        <SelectItem value="обычный">Обычный</SelectItem>
                        <SelectItem value="срочный">Срочный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий к заказу</Label>
                    <Textarea
                      id="comment"
                      rows={1}
                      placeholder="Особые требования, маркировка, тип барабанов"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-md border border-dashed border-accent/50 bg-accent/5 p-4">
                  <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent">
                    <Plus className="size-4" /> Добавить позицию
                  </p>
                  <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-end">
                    <div className="space-y-2">
                      <Label>Марка кабеля</Label>
                      <Select
                        value={model}
                        onValueChange={(v) => {
                          setModel(v);
                          setSize("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите марку" />
                        </SelectTrigger>
                        <SelectContent>
                          {CABLE_MODELS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Сечение</Label>
                      <Select value={size} onValueChange={setSize} disabled={!model}>
                        <SelectTrigger>
                          <SelectValue placeholder="Размер" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizes.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="len">Метраж, м</Label>
                      <Input
                        id="len"
                        type="number"
                        min={1}
                        value={length}
                        onChange={(e) => setLength(Number(e.target.value))}
                      />
                    </div>
                    <Button type="button" onClick={addItem}>
                      <Plus className="size-4" /> Добавить
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Позиция</TableHead>
                        <TableHead className="text-right">Метраж, м</TableHead>
                        <TableHead className="text-right">Масса, кг</TableHead>
                        <TableHead className="text-right">Барабаны</TableHead>
                        <TableHead className="text-right">Время</TableHead>
                        <TableHead className="text-right">Стоимость</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calc.items.map((it) => (
                        <TableRow key={it.item.id}>
                          <TableCell>
                            <p className="font-medium">{it.product.name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{it.product.article}</p>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatNum(it.lengthM)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatNum(it.weightKg)}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {it.drums} × {it.drumLength} м
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatHours(it.productionHours)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatSum(it.price)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setItems((p) => p.filter((x) => x.id !== it.item.id))}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {calc.items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                            Позиции ещё не добавлены
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Button size="lg" className="w-full" onClick={saveOrder}>
                  <ClipboardList className="size-4" /> Создать заказ и маршрутные карты
                </Button>
              </div>

              <div className="space-y-4">
                <div className="panel p-5">
                  <h2 className="font-display text-base font-semibold uppercase">Сводный расчёт</h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <Row icon={Layers} k="Общий метраж" v={`${formatNum(calc.totalLength)} м`} />
                    <Row icon={Weight} k="Масса нетто" v={`${formatNum(calc.totalWeight)} кг`} />
                    <Row icon={Timer} k="Время производства" v={formatHours(calc.totalHours)} />
                    <Row icon={Timer} k="Смен (8 ч)" v={`${calc.totalShifts}`} />
                    <Row icon={Timer} k="Календарных дней" v={`${calc.totalDays}`} />
                    <Row icon={Timer} k="Плановый выпуск" v={calc.finishDate} />
                    <Row icon={Coins} k="Материалы" v={formatSum(calc.totalMaterialCost)} />
                    <Row icon={Coins} k="Сумма заказа" v={formatSum(calc.totalPrice)} />
                  </dl>
                </div>

                <div className="panel p-5">
                  <h2 className="font-display text-base font-semibold uppercase">Расход материалов</h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <Row k="Проводник (медь/алюминий)" v={`${formatNum(calc.totalCopper, 1)} кг`} />
                    <Row k="ПВХ-пластикат" v={`${formatNum(calc.totalPvc, 1)} кг`} />
                    <Row k="Экран (фольга/оплётка)" v={`${formatNum(calc.totalScreen, 1)} кг`} />
                    <Row k="Стальная лента" v={`${formatNum(calc.totalArmor, 1)} кг`} />
                  </dl>
                </div>

                <div className="panel p-5">
                  <h2 className="font-display text-base font-semibold uppercase">Маршрутизация по цехам</h2>
                  <div className="mt-3 space-y-3">
                    {calc.workshopLoad.map((w) => (
                      <div key={w.workshop}>
                        <div className="mb-1 flex justify-between gap-2 text-xs">
                          <span className="truncate font-medium">{w.workshop}</span>
                          <span className="shrink-0 font-mono text-muted-foreground">
                            {formatNum(w.hours, 1)} ч
                          </span>
                        </div>
                        <Progress value={(w.hours / (calc.workshopLoad[0]?.hours || 1)) * 100} />
                      </div>
                    ))}
                    {calc.workshopLoad.length === 0 && (
                      <p className="text-sm text-muted-foreground">Добавьте позиции для расчёта загрузки</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {calc.items.length > 0 && (
              <div className="panel p-5">
                <h2 className="font-display text-lg font-semibold uppercase">
                  Технологические карты по позициям
                </h2>
                <div className="mt-4 space-y-6">
                  {calc.items.map((it) => (
                    <div key={it.item.id}>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {it.product.article}
                        </Badge>
                        <p className="font-medium">
                          {it.product.name} · {formatNum(it.lengthM)} м · {formatHours(it.productionHours)}
                        </p>
                        <Button asChild size="sm" variant="ghost" className="ml-auto">
                          <Link to="/reports" search={{ productId: it.product.id }}>
                            <Printer className="size-4" /> Печатная карта
                          </Link>
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10">№</TableHead>
                              <TableHead>Операция</TableHead>
                              <TableHead>Цех</TableHead>
                              <TableHead>Оборудование</TableHead>
                              <TableHead className="text-right">Скорость</TableHead>
                              <TableHead className="text-right">Наладка</TableHead>
                              <TableHead className="text-right">Время</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {it.steps.map((s, i) => (
                              <TableRow key={s.processId}>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  {String(i + 1).padStart(2, "0")}
                                </TableCell>
                                <TableCell className="font-medium">{s.processName}</TableCell>
                                <TableCell className="text-xs">{s.workshop}</TableCell>
                                <TableCell className="text-xs">
                                  {s.machineName}
                                  <span className="ml-1 font-mono text-muted-foreground">({s.machineCode})</span>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatNum(s.ratePerHour)} м/ч
                                </TableCell>
                                <TableCell className="text-right tabular-nums">{s.setupMinutes} мин</TableCell>
                                <TableCell className="text-right font-medium tabular-nums">
                                  {formatHours(s.totalHours)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {orders.map((o) => {
                const c = calcOrder(o);
                return (
                  <article key={o.id} className="panel animate-rise p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-semibold">{o.number}</p>
                      <Badge
                        variant="outline"
                        className={
                          o.status === "в производстве"
                            ? "border-success/40 bg-success/15 text-success"
                            : o.status === "выполнен"
                              ? "border-border bg-muted text-muted-foreground"
                              : "border-warning/40 bg-warning/15 text-warning"
                        }
                      >
                        {o.status}
                      </Badge>
                      {o.priority === "срочный" && <Badge variant="destructive">срочный</Badge>}
                      <span className="ml-auto text-xs text-muted-foreground">до {o.dueDate}</span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-semibold">{o.customer}</h3>
                    <p className="text-xs text-muted-foreground">
                      Менеджер: {o.manager} · создан {o.createdAt}
                    </p>
                    <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                      {c.items.map((it) => (
                        <li key={it.item.id} className="flex justify-between gap-2">
                          <span className="truncate">{it.product.name}</span>
                          <span className="shrink-0 font-mono text-muted-foreground">
                            {formatNum(it.lengthM)} м
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <Mini label="Масса" value={`${formatNum(c.totalWeight)} кг`} />
                      <Mini label="Время" value={`${formatNum(c.totalHours, 1)} ч`} />
                      <Mini label="Сумма" value={formatSum(c.totalPrice)} />
                    </div>
                    {o.comment && <p className="mt-3 text-xs text-muted-foreground">{o.comment}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {o.status !== "в производстве" && (
                        <Button size="sm" onClick={() => updateOrderStatus(o.id, "в производстве")}>
                          Запустить в производство
                        </Button>
                      )}
                      {o.status !== "выполнен" && (
                        <Button size="sm" variant="outline" onClick={() => updateOrderStatus(o.id, "выполнен")}>
                          Отметить выполненным
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => removeOrder(o.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </article>
                );
              })}
              {orders.length === 0 && (
                <p className="text-sm text-muted-foreground">Заказы отсутствуют — создайте первый.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </AppShell>
    </Protected>
  );
}

function Row({ k, v, icon: Icon }: { k: string; v: string; icon?: typeof Timer }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
      <dt className="inline-flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {k}
      </dt>
      <dd className="text-right font-medium tabular-nums">{v}</dd>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 p-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  );
}
