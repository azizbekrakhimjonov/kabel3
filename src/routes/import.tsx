import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { AppShell } from "@/components/layout/AppShell";
import { Protected } from "@/components/layout/Protected";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRODUCTS } from "@/lib/data/products";
import { useApp, type ImportedRow } from "@/lib/store";
import { UploadCloud, FileSpreadsheet, Trash2, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatNum } from "@/lib/calc";

export const Route = createFileRoute("/import")({
  head: () => ({
    meta: [
      { title: "Импорт Excel — CTMS кабельный завод" },
      {
        name: "description",
        content: "Загрузка заявок из файлов Excel с предпросмотром строк и сопоставлением марок кабеля.",
      },
      { property: "og:title", content: "Импорт Excel — CTMS" },
      { property: "og:description", content: "Импорт заявок формата XLSX с автоматическим сопоставлением." },
    ],
  }),
  component: ImportPage,
});

const normalize = (v: unknown) => String(v ?? "").trim();

function matchProduct(model: string, size: string) {
  const m = model.toLowerCase();
  const s = size.toLowerCase().replace(",", ".").replace("х", "x");
  return PRODUCTS.find((p) => p.model.toLowerCase() === m && p.size.toLowerCase() === s)?.id ?? null;
}

function ImportPage() {
  const { imported, setImported } = useApp();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const rows: ImportedRow[] = json.map((r, i) => {
        const keys = Object.keys(r);
        const pick = (...names: string[]) => {
          const key = keys.find((k) => names.some((n) => k.toLowerCase().includes(n)));
          return key ? normalize(r[key]) : "";
        };
        const model = pick("марка", "модель", "model");
        const size = pick("сечен", "размер", "size");
        const length = Number(pick("метр", "длин", "кол", "length").replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
        return {
          id: `imp-${i}`,
          model,
          size,
          lengthM: length,
          customer: pick("заказчик", "клиент", "customer"),
          matchedProductId: matchProduct(model, size),
        };
      });
      setImported(rows);
      setFileName(file.name);
      toast.success(`Загружено строк: ${rows.length}`);
    } catch {
      toast.error("Не удалось прочитать файл. Поддерживается формат .xlsx");
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Марка: "КВВГЭнг(А)", Сечение: "10x1.5", Метраж: 2500, Заказчик: 'АО "Узбекэнерго"' },
      { Марка: "ВВГнг(А)-LS", Сечение: "4x6", Метраж: 1200, Заказчик: 'ООО "Стройсервис"' },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Заявка");
    XLSX.writeFile(wb, "shablon-zayavki.xlsx");
  };

  const matched = imported.filter((r) => r.matchedProductId).length;

  return (
    <Protected>
      <AppShell
        title="Импорт Excel"
        subtitle="Загрузка заявок из XLSX с сопоставлением номенклатуры"
        actions={
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="size-4" /> Шаблон заявки
          </Button>
        }
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={`panel grid-blueprint flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-12 text-center transition ${
            dragging ? "border-accent bg-accent/10" : "border-border"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className={`size-10 ${dragging ? "text-accent" : "text-muted-foreground"}`} />
          <p className="font-display text-lg font-semibold uppercase">Перетащите файл Excel сюда</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Поддерживаются файлы .xlsx и .xls со столбцами: Марка, Сечение, Метраж, Заказчик.
          </p>
          <Button type="button" variant="outline">
            <FileSpreadsheet className="size-4" /> Выбрать файл
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </div>

        {imported.length > 0 && (
          <div className="panel mt-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold uppercase">
                  Предпросмотр · {fileName ?? "загруженный файл"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Строк: {imported.length} · сопоставлено с номенклатурой: {matched}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setImported([])}>
                <Trash2 className="size-4" /> Очистить
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№</TableHead>
                    <TableHead>Марка</TableHead>
                    <TableHead>Сечение</TableHead>
                    <TableHead className="text-right">Метраж, м</TableHead>
                    <TableHead>Заказчик</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imported.map((r, i) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{r.model || "—"}</TableCell>
                      <TableCell className="font-mono text-sm">{r.size || "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatNum(r.lengthM)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.customer || "—"}</TableCell>
                      <TableCell>
                        {r.matchedProductId ? (
                          <Badge className="bg-success/15 text-success" variant="outline">
                            <CheckCircle2 className="mr-1 size-3" /> Сопоставлено
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-warning/40 bg-warning/15 text-warning">
                            <AlertTriangle className="mr-1 size-3" /> Нет в базе
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </AppShell>
    </Protected>
  );
}
