import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import type { EmployeeRole } from "@/lib/types";

export function NameSelect({
  role,
  value,
  onChange,
  placeholder,
  className,
}: {
  role: EmployeeRole;
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const { employees } = useApp();
  const list = employees.filter((e) => e.role === role);

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder ?? role} />
      </SelectTrigger>
      <SelectContent>
        {list.map((e) => (
          <SelectItem key={e.id} value={e.name}>
            {e.name}
          </SelectItem>
        ))}
        {!list.length && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">Нет в справочнике «Сотрудники»</div>
        )}
      </SelectContent>
    </Select>
  );
}
