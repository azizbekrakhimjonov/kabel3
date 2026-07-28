import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { calcOrder, formatHours, formatNum } from "@/lib/calc";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { NameSelect } from "@/components/NameSelect";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ClipboardCheck, Loader2, PackageCheck, RotateCcw, ShieldCheck, User, Users } from "lucide-react";
import { toast } from "sonner";

const fmtClock = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function useTicker(active: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
}

const durationText = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h} ч ${String(m).padStart(2, "0")} мин ${String(s).padStart(2, "0")} с`;
};

export function ProductionTracker({ order }: { order: Order }) {
  const { completeStep, undoStep, markStepStart, updateOrderStatus } = useApp();
  const calc = calcOrder(order);
  const progress = order.progress ?? [];
  useTicker(order.status === "в производстве");

  const [operator, setOperator] = useState("");
  const [otk, setOtk] = useState("И. Абдуллаев");
  const [masterShift, setMasterShift] = useState("");
  const [sectionChief, setSectionChief] = useState("");

  const allDone = calc.items.every(
    (it) => progress.filter((p) => p.itemId === it.item.id).length >= it.steps.length,
  );

  useEffect(() => {
    if (allDone && order.status === "в производстве" && calc.items.length > 0) {
      updateOrderStatus(order.id, "выполнен");
      toast.success(`Заказ ${order.number}: все операции завершены, статус «выполнен»`);
    }
  }, [allDone, order.status, order.id, order.number, calc.items.length, updateOrderStatus]);

  return (
    <div className="mt-4 space-y-5 border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="bg-success/15 text-success hover:bg-success/15">Производство запущено</Badge>
        {order.startedAt && (
          <span className="text-xs text-muted-foreground">
            Старт: {fmtClock(order.startedAt)} · в работе {durationText(Date.now() - new Date(order.startedAt).getTime())}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
            <Users className="mr-1 inline size-3" /> Мастер смены
          </Label>
          <NameSelect role="Мастер смены" value={masterShift} onChange={setMasterShift} className="h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
            <ClipboardCheck className="mr-1 inline size-3" /> Нач. участка
          </Label>
          <NameSelect role="Нач. участка" value={sectionChief} onChange={setSectionChief} className="h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
            <User className="mr-1 inline size-3" /> Оператор
          </Label>
          <NameSelect role="Оператор" value={operator} onChange={setOperator} className="h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="mr-1 inline size-3" /> Контролёр ОТК
          </Label>
          <NameSelect role="Контролёр ОТК" value={otk} onChange={setOtk} className="h-8" />
        </div>
      </div>

      {calc.items.map((it) => {
        const itemProgress = progress
          .filter((p) => p.itemId === it.item.id)
          .sort((a, b) => a.stepIndex - b.stepIndex);
        const doneCount = itemProgress.length;
        const currentIndex = doneCount < it.steps.length ? doneCount : -1;
        const factHours =
          itemProgress.reduce(
            (a, p) => a + (new Date(p.finishedAt).getTime() - new Date(p.startedAt).getTime()),
            0,
          ) / 3_600_000;
        const currentStartIso =
          itemProgress.at(-1)?.finishedAt ?? order.startedAt ?? new Date().toISOString();

        return (
          <div key={it.item.id} className="rounded-md border border-border bg-muted/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{it.product.name}</p>
              <Badge variant="outline" className="font-mono text-[10px]">
                {formatNum(it.lengthM)} м
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {it.isSemi ? `п/ф до «${it.stageName}»` : "готовая продукция"}
              </Badge>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                {doneCount}/{it.steps.length} операций
              </span>
            </div>
            <Progress className="mt-2" value={(doneCount / it.steps.length) * 100} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              План: {formatHours(it.productionHours)} · Факт: {formatHours(Math.round(factHours * 100) / 100)}
            </p>

            <ol className="mt-3 space-y-1.5">
              {it.steps.map((s, i) => {
                const rec = itemProgress.find((p) => p.stepIndex === i);
                const isCurrent = i === currentIndex;
                const arrivedIso = isCurrent ? order.stepStarts?.[it.item.id]?.[i] : undefined;
                const idleMs = arrivedIso ? new Date(arrivedIso).getTime() - new Date(currentStartIso).getTime() : 0;
                return (
                  <li
                    key={s.processId}
                    className={`rounded border px-2.5 py-2 text-xs ${
                      rec
                        ? "border-success/30 bg-success/5"
                        : isCurrent
                          ? "border-accent/50 bg-accent/5"
                          : "border-border/60 bg-card"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {rec ? (
                        <CheckCircle2 className="size-4 shrink-0 text-success" />
                      ) : isCurrent ? (
                        <Loader2 className="size-4 shrink-0 animate-spin text-accent" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-medium">{s.processName}</span>
                      <span className="text-muted-foreground">· {s.machineCode}</span>
                      <span className="ml-auto font-mono text-muted-foreground">
                        план {formatHours(s.totalHours)}
                      </span>
                    </div>

                    {rec && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 pl-6 text-[11px] text-muted-foreground">
                        <span>Мастер смены: {rec.masterShift || "—"}</span>
                        <span>Нач. участка: {rec.sectionChief || "—"}</span>
                        <span>Оператор: {rec.operator}</span>
                        <span>ОТК: {rec.otk}</span>
                        <span>Завершено: {fmtClock(rec.finishedAt)}</span>
                        <span className="font-mono">
                          факт {durationText(new Date(rec.finishedAt).getTime() - new Date(rec.startedAt).getTime())}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => undoStep(order.id, it.item.id, i)}
                        >
                          <RotateCcw className="size-3" /> Отменить
                        </Button>
                      </div>
                    )}

                    {isCurrent && (() => {
                      const plan = order.stepAssignments?.[it.item.id]?.[s.processId];
                      return (
                      <div className="mt-2 flex flex-wrap items-center gap-3 pl-6">
                        {arrivedIso ? (
                          <>
                            <span className="font-mono text-[11px] text-accent">
                              вход {fmtClock(arrivedIso)} · идёт {durationText(Date.now() - new Date(arrivedIso).getTime())}
                            </span>
                            {idleMs > 0 && (
                              <span className="font-mono text-[11px] font-semibold text-warning">
                                простой перед: {durationText(idleMs)}
                              </span>
                            )}
                            {plan && (plan.masterShift || plan.sectionChief || plan.operator) && (
                              <span className="text-[11px] text-muted-foreground">
                                план: {plan.masterShift || "—"} / {plan.sectionChief || "—"} / {plan.operator || "—"}
                                {" · "}
                                <button
                                  type="button"
                                  className="underline underline-offset-2 hover:text-accent"
                                  onClick={() => {
                                    if (plan.masterShift) setMasterShift(plan.masterShift);
                                    if (plan.sectionChief) setSectionChief(plan.sectionChief);
                                    if (plan.operator) setOperator(plan.operator);
                                  }}
                                >
                                  заполнить по плану
                                </button>
                              </span>
                            )}
                            <Button
                              size="sm"
                              className="h-7"
                              onClick={() => {
                                if (!masterShift.trim() || !sectionChief.trim() || !operator.trim() || !otk.trim()) {
                                  toast.error("Укажите мастера смены, нач. участка, оператора и контролёра ОТК");
                                  return;
                                }
                                completeStep(order.id, {
                                  itemId: it.item.id,
                                  stepIndex: i,
                                  operator,
                                  otk,
                                  masterShift,
                                  sectionChief,
                                  startedAt: arrivedIso,
                                });
                                setMasterShift("");
                                setSectionChief("");
                                setOperator("");
                                setOtk("");
                                toast.success(`${s.processName} — операция завершена, принята ОТК`);
                              }}
                            >
                              <CheckCircle2 className="size-3.5" /> Завершить операцию
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="font-mono text-[11px] font-semibold text-warning">
                              в очереди {durationText(Date.now() - new Date(currentStartIso).getTime())}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7"
                              onClick={() => markStepStart(order.id, it.item.id, i)}
                            >
                              <PackageCheck className="size-3.5" /> Материал поступил
                            </Button>
                          </>
                        )}
                      </div>
                      );
                    })()}
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
