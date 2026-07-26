import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";
import { PRODUCTS } from "@/lib/data/products";
import { MACHINES, MATERIALS, STANDARDS } from "@/lib/data/catalog";
import { toast } from "sonner";
import { Database, Trash2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Настройки системы — CTMS кабельный завод" },
      {
        name: "description",
        content: "Настройки интерфейса, сведения о базе данных номенклатуры и сброс локальных данных системы.",
      },
      { property: "og:title", content: "Настройки системы — CTMS" },
      { property: "og:description", content: "Параметры интерфейса и состояние справочников CTMS." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggleTheme, user, orders, favorites } = useApp();

  const stats = [
    { label: "Номенклатура", value: PRODUCTS.length },
    { label: "Оборудование", value: MACHINES.length },
    { label: "Материалы", value: MATERIALS.length },
    { label: "Стандарты", value: STANDARDS.length },
    { label: "Заказы", value: orders.length },
    { label: "Избранное", value: favorites.length },
  ];

  return (
    <Protected>
      <AppShell title="Настройки" subtitle="Параметры рабочего места и состояние справочников">
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="panel p-5">
            <h2 className="font-display text-base font-semibold uppercase">Интерфейс</h2>
            <div className="mt-4 flex items-center justify-between gap-4 rounded-md border border-border p-4">
              <div className="min-w-0">
                <Label htmlFor="theme">Тёмная тема цеха</Label>
                <p className="text-xs text-muted-foreground">
                  Пониженная яркость для мониторов на производственных участках.
                </p>
              </div>
              <Switch id="theme" checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
            <div className="mt-3 rounded-md border border-border p-4 text-sm">
              <p className="inline-flex items-center gap-2 font-medium">
                <ShieldCheck className="size-4 text-success" /> Учётная запись
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Пользователь: <span className="font-mono">{user}</span> · роль: технолог-планировщик
              </p>
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="inline-flex items-center gap-2 font-display text-base font-semibold uppercase">
              <Database className="size-4" /> База данных
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-md bg-muted/50 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                  <p className="font-display text-xl font-semibold tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>
            <Badge variant="outline" className="mt-4 font-mono text-[11px]">
              Локальное хранилище браузера · MES 1.4.0
            </Badge>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith("ctms."))
                  .forEach((k) => localStorage.removeItem(k));
                toast.success("Локальные данные сброшены. Обновите страницу.");
              }}
            >
              <Trash2 className="size-4" /> Сбросить локальные данные
            </Button>
          </section>
        </div>
      </AppShell>
    </Protected>
  );
}
