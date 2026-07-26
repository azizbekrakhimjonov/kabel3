import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Cable, Lock, User, ShieldCheck, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Вход в систему — CTMS кабельный завод" },
      { name: "description", content: "Авторизация сотрудников кабельного завода в MES-системе CTMS." },
      { property: "og:title", content: "Вход в систему — CTMS" },
      { property: "og:description", content: "Авторизация сотрудников кабельного завода в системе CTMS." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("operator");
  const [password, setPassword] = useState("cable2024");
  const [remember, setRemember] = useState(true);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="industrial-gradient relative hidden overflow-hidden text-primary-foreground lg:block">
        <div className="grid-blueprint absolute inset-0 opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-md bg-accent text-accent-foreground">
              <Cable className="size-6" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold uppercase tracking-widest">CTMS</p>
              <p className="text-xs opacity-75">Cable Technology Management System</p>
            </div>
          </div>
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-semibold uppercase leading-tight">
              Технологическое управление кабельным производством
            </h2>
            <p className="mt-4 text-sm opacity-80">
              Единая среда для маршрутных карт, оборудования, материалов, стандартов ГОСТ/ТУ и расчёта
              производственных заказов.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                ["50", "марок кабеля"],
                ["20", "единиц оборудования"],
                ["5", "производственных цехов"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-md bg-primary-foreground/10 p-3">
                  <p className="font-display text-2xl font-semibold">{v}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide opacity-75">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="inline-flex items-center gap-2 text-xs opacity-70">
            <Factory className="size-4" /> Ташкентский кабельный завод · Смена 2
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-12">
        <form
          className="panel animate-rise w-full max-w-md p-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!username || !password) {
              toast.error("Введите логин и пароль");
              return;
            }
            login(username);
            toast.success(`Добро пожаловать, ${username}`);
            navigate({ to: "/" });
          }}
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Cable className="size-5" />
            </div>
            <p className="font-display text-lg font-semibold uppercase">CTMS</p>
          </div>
          <h1 className="font-display text-2xl font-semibold uppercase">Вход в систему</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Используйте корпоративную учётную запись сотрудника завода.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                Запомнить меня
              </label>
              <button
                type="button"
                onClick={() => toast.info("Обратитесь к администратору АСУ ТП завода, вн. 214")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Забыли пароль?
              </button>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Войти в систему
            </Button>
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-success" /> Демо-доступ: operator / cable2024
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
