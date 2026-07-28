import { useState } from "react";
import type { Product } from "@/lib/types";
import { PROCESSES, MACHINES } from "@/lib/data/catalog";
import { getRouteForProduct } from "@/lib/data/products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Gauge, Thermometer, CheckCircle2, Cog, Factory } from "lucide-react";
import { formatHours, stepLengthM, stepProcessName } from "@/lib/calc";

export function RouteTimeline({ product, lengthM = 1000 }: { product: Product; lengthM?: number }) {
  const route = getRouteForProduct(product.id);
  const [openStep, setOpenStep] = useState<string | null>(null);
  if (!route) return null;

  const active = route.steps.find((s) => s.processId === openStep);
  const activeProcess = PROCESSES.find((p) => p.id === openStep);
  const activeMachine = MACHINES.find((m) => m.id === active?.machineId);

  return (
    <>
      <ol className="relative space-y-3">
        {route.steps.map((step, i) => {
          const proc = PROCESSES.find((p) => p.id === step.processId)!;
          const machine = MACHINES.find((m) => m.id === step.machineId)!;
          const processName = stepProcessName(step.processId, product, proc.name);
          const hours = stepLengthM(step.processId, product, lengthM) / step.ratePerHour + step.setupMinutes / 60;
          return (
            <li key={step.processId} className="animate-rise" style={{ animationDelay: `${i * 45}ms` }}>
              <button
                type="button"
                onClick={() => setOpenStep(step.processId)}
                className="panel group flex w-full items-center gap-4 p-4 text-left transition-all hover:border-accent hover:shadow-lg"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 font-mono text-sm font-semibold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-semibold">{processName}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {proc.workshop}
                    </Badge>
                  </span>
                  <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Cog className="size-3" /> {machine.name} · {machine.code}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Gauge className="size-3" /> {step.ratePerHour.toLocaleString("ru-RU")} м/ч
                    </span>
                    <span className="font-mono">{formatHours(hours)}</span>
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 -rotate-90 text-muted-foreground transition-transform group-hover:text-accent" />
              </button>
              {i < route.steps.length - 1 && (
                <div className="ml-9 flex h-4 w-px flex-col items-center bg-border">
                  <span className="animate-flow h-full w-px bg-accent" />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <Dialog open={!!openStep} onOpenChange={(o) => !o && setOpenStep(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {activeProcess && activeMachine && active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl uppercase">
                  {stepProcessName(activeProcess.id, product, activeProcess.name)}
                </DialogTitle>
                <DialogDescription>{activeProcess.description}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoBlock title="Оборудование" icon={Cog}>
                  <p className="font-medium">{activeMachine.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{activeMachine.code}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{activeMachine.description}</p>
                </InfoBlock>
                <InfoBlock title="Цех" icon={Factory}>
                  <p className="font-medium">{activeProcess.workshop}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Производительность перехода: {active.ratePerHour.toLocaleString("ru-RU")} м/ч
                  </p>
                  <p className="text-xs text-muted-foreground">Наладка: {active.setupMinutes} мин</p>
                </InfoBlock>
                <InfoBlock title="Рабочие параметры" icon={Thermometer}>
                  <dl className="space-y-1 text-xs">
                    <Row k="Скорость" v={activeProcess.params.speed} />
                    <Row k="Температура" v={activeProcess.params.temperature} />
                    {activeProcess.params.tension && <Row k="Натяжение" v={activeProcess.params.tension} />}
                  </dl>
                </InfoBlock>
                <InfoBlock title="Требования качества" icon={CheckCircle2}>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {activeProcess.quality.map((q) => (
                      <li key={q} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-success" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </InfoBlock>
              </div>
              <div className="rounded-md border border-dashed border-accent/50 bg-accent/5 p-3 text-xs">
                <p className="font-semibold uppercase tracking-wide text-accent">Примечания оператору</p>
                <p className="mt-1 text-muted-foreground">{activeProcess.operatorNotes}</p>
                <p className="mt-2 text-muted-foreground">{active.note}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Cog;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3">
      <p className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3.5" /> {title}
      </p>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}
