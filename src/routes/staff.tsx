import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { EMPLOYEE_ROLES, type EmployeeRole } from "@/lib/types";
import { Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Сотрудники — CTMS кабельный завод" },
      {
        name: "description",
        content: "Справочник ответственных сотрудников: мастера смены, начальники участков, операторы, контролёры ОТК.",
      },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const { employees, addEmployee, removeEmployee } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState<EmployeeRole>("Оператор");

  const submit = () => {
    if (!name.trim()) {
      toast.error("Укажите Ф.И.О. сотрудника");
      return;
    }
    addEmployee(name, role);
    toast.success(`${name.trim()} добавлен(а) — ${role}`);
    setName("");
  };

  return (
    <Protected>
      <AppShell title="Сотрудники" subtitle={`${employees.length} человек в справочнике — используются в план-задании и производственном учёте`}>
        <div className="panel mb-5 flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[220px] flex-1 space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Ф.И.О.</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Азизбек Юсупов"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div className="w-56 space-y-1.5">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">Роль</label>
            <Select value={role} onValueChange={(v) => setRole(v as EmployeeRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={submit}>
            <UserPlus className="size-4" /> Добавить
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {EMPLOYEE_ROLES.map((r) => {
            const list = employees.filter((e) => e.role === r);
            return (
              <div key={r} className="panel p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="inline-flex items-center gap-1.5 font-display text-sm font-semibold uppercase">
                    <Users className="size-4 text-accent" /> {r}
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    {list.length}
                  </Badge>
                </div>
                <ul className="space-y-1.5">
                  {list.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-2.5 py-1.5 text-sm"
                    >
                      <span className="min-w-0 truncate">{e.name}</span>
                      <button
                        type="button"
                        aria-label="Удалить"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeEmployee(e.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </li>
                  ))}
                  {!list.length && <li className="text-xs text-muted-foreground">Никого нет</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </AppShell>
    </Protected>
  );
}
