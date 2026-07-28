import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Package,
  Cog,
  GitBranch,
  BookMarked,
  Search,
  FileSpreadsheet,
  FileText,
  Star,
  History,
  Activity,
  ClipboardList,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PRODUCTS, ROUTES } from "@/lib/data/products";
import { MACHINES, STANDARDS, WORKSHOPS } from "@/lib/data/catalog";
import { useApp } from "@/lib/store";
import { calcOrder, formatNum } from "@/lib/calc";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Панель управления — CTMS кабельный завод" },
      {
        name: "description",
        content:
          "Оперативная панель кабельного завода: продукция, оборудование, маршруты, стандарты и активные заказы.",
      },
      { property: "og:title", content: "Панель управления — CTMS" },
      {
        property: "og:description",
        content: "Оперативные показатели кабельного производства в единой MES-системе.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { favorites, recent, orders } = useApp();
  const activeOrders = orders.filter((o) => o.status !== "выполнен");
  const load = calcOrder({ items: activeOrders.flatMap((o) => o.items) });
  const running = MACHINES.filter((m) => m.status === "работает").length;

  return (
    <Protected>
      <AppShell
        title="Панель управления"
        subtitle={`Кабельный завод · ${WORKSHOPS.length} цеха · смена 2`}
        actions={
          <Button asChild size="sm">
            <Link to="/search">
              <Search className="size-4" /> Найти кабель
            </Link>
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Марок продукции" value={PRODUCTS.length} hint="в технологической базе" icon={Package} />
          <KpiCard
            label="Оборудование"
            value={`${running}/${MACHINES.length}`}
            hint="единиц в работе"
            icon={Cog}
            tone="success"
            delay={60}
          />
          <KpiCard
            label="Маршрутные карты"
            value={ROUTES.length}
            hint={`${ROUTES.reduce((a, r) => a + r.steps.length, 0)} технологических переходов`}
            icon={GitBranch}
            tone="accent"
            delay={120}
          />
          <KpiCard
            label="Стандарты ГОСТ/ТУ"
            value={STANDARDS.length}
            hint="действующая нормативная база"
            icon={BookMarked}
            tone="warning"
            delay={180}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="panel p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="inline-flex items-center gap-2 font-display text-lg font-semibold uppercase">
                <Activity className="size-4 text-accent" /> Загрузка цехов по активным заказам
              </h2>
              <Badge variant="outline">{activeOrders.length} заказа в работе</Badge>
            </div>
            <div className="mt-4 space-y-4">
              {load.workshopLoad.length === 0 && (
                <p className="text-sm text-muted-foreground">Активных заказов нет.</p>
              )}
              {load.workshopLoad.map((w) => {
                const max = load.workshopLoad[0].hours || 1;
                return (
                  <div key={w.workshop}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium">{w.workshop}</span>
                      <span className="font-mono text-muted-foreground">{formatNum(w.hours, 1)} ч</span>
                    </div>
                    <Progress value={(w.hours / max) * 100} />
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <Metric label="Метраж в заказах" value={`${formatNum(load.totalLength)} м`} />
              <Metric label="Расчётная масса" value={`${formatNum(load.totalWeight)} кг`} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="panel p-5">
              <h2 className="mb-3 font-display text-base font-semibold uppercase">Быстрые действия</h2>
              <div className="grid gap-2">
                <QuickAction to="/search" icon={Search} label="Поиск продукции" />
                <QuickAction to="/orders" icon={ClipboardList} label="Новый заказ" />
                <QuickAction to="/import" icon={FileSpreadsheet} label="Импорт Excel" />
                <QuickAction to="/reports" icon={FileText} label="Сформировать отчёт" />
              </div>
            </div>

            <div className="panel p-5">
              <h2 className="mb-3 inline-flex items-center gap-2 font-display text-base font-semibold uppercase">
                <History className="size-4 text-muted-foreground" /> Недавние поиски
              </h2>
              <ul className="space-y-2 text-sm">
                {recent.map((r) => (
                  <li key={`${r.model}-${r.size}`} className="flex items-center justify-between gap-2">
                    <Link
                      to="/search"
                      search={{ model: r.model, size: r.size }}
                      className="truncate font-medium hover:text-primary"
                    >
                      {r.model} {r.size}
                    </Link>
                    <span className="shrink-0 text-xs text-muted-foreground">{r.at}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-5">
              <h2 className="mb-3 inline-flex items-center gap-2 font-display text-base font-semibold uppercase">
                <Star className="size-4 text-accent" /> Избранная продукция
              </h2>
              <ul className="space-y-2 text-sm">
                {favorites.length === 0 && <li className="text-muted-foreground">Список пуст</li>}
                {favorites.map((id) => {
                  const p = PRODUCTS.find((x) => x.id === id);
                  if (!p) return null;
                  return (
                    <li key={id}>
                      <Link
                        to="/products/$productId"
                        params={{ productId: p.id }}
                        className="flex items-center justify-between gap-2 hover:text-primary"
                      >
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {formatNum(p.weightKgPerKm)} кг/км
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 p-3">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof Search;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-accent hover:bg-accent/10"
    >
      <Icon className="size-4 text-accent" />
      {label}
    </Link>
  );
}
