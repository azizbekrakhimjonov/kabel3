import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useApp, useHydrated } from "@/lib/store";
import { Cable } from "lucide-react";

export function Protected({ children }: { children: ReactNode }) {
  const { authed } = useApp();
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Cable className="size-5 animate-pulse" />
          <span className="font-display text-sm uppercase tracking-widest">Загрузка системы…</span>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="panel max-w-sm p-8 text-center">
          <h2 className="font-display text-xl font-semibold uppercase">Требуется авторизация</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Войдите в систему под учётной записью сотрудника завода.
          </p>
          <Link
            to="/login"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Перейти к входу
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
