export type MachineStatus = "работает" | "простой" | "ремонт" | "наладка";

export interface Machine {
  id: string;
  name: string;
  code: string;
  workshop: string;
  description: string;
  status: MachineStatus;
  capacity: string;
  capacityMPerHour: number;
  power: string;
  year: number;
  operationIds: string[];
}

export interface Material {
  id: string;
  name: string;
  type: "проводник" | "изоляция" | "экран" | "броня" | "оболочка" | "вспомогательный";
  description: string;
  usage: string;
  density: number; // г/см3
  supplier: string;
  pricePerKg: number; // сум/кг
  unit: string;
}

export interface Standard {
  id: string;
  number: string;
  title: string;
  type: "ГОСТ" | "ТУ";
  description: string;
  products: string[];
  year: number;
}

export interface ProcessStep {
  id: string;
  name: string;
  shortName: string;
  workshop: string;
  description: string;
  operatorNotes: string;
  machineIds: string[];
  params: {
    speed: string;
    temperature: string;
    tension?: string;
  };
  quality: string[];
  baseRateMPerHour: number; // базовая скорость перехода, м/ч
  setupMinutes: number;
}

export interface Product {
  id: string;
  article: string;
  model: string;
  size: string; // 10x1.5
  cores: number;
  section: number;
  name: string;
  description: string;
  voltage: string;
  conductor: string;
  conductorMaterial: "Медь" | "Алюминий";
  insulation: string;
  insulationMaterial: string;
  screen: string;
  armor: string;
  jacket: string;
  weightKgPerKm: number;
  outerDiameter: number;
  temperature: string;
  bendRadius: string;
  gost: string;
  tu: string;
  notes: string;
  routeId: string;
  copperKgPerKm: number;
  pvcKgPerKm: number;
  screenKgPerKm: number;
  armorKgPerKm: number;
  pricePerM: number;
}

export interface ProductionRoute {
  id: string;
  productId: string;
  code: string;
  steps: RouteStep[];
  totalHoursPer1000m: number;
}

export interface RouteStep {
  processId: string;
  machineId: string;
  ratePerHour: number;
  setupMinutes: number;
  note: string;
}

export type Readiness = "готовая" | "полуфабрикат";

export interface OrderItem {
  id: string;
  productId: string;
  lengthM: number;
  drums: number;
  /** Количество технологических переходов, включённых в заказ (undefined — полный маршрут) */
  stageTo?: number;
  readiness?: Readiness;
}

export interface StepProgress {
  itemId: string;
  stepIndex: number;
  startedAt: string;
  finishedAt: string;
  operator: string;
  otk: string;
  /** Мастер смены, фактически принявший операцию */
  masterShift: string;
  /** Начальник участка, фактически принявший операцию */
  sectionChief: string;
  note?: string;
}

export interface Assignment {
  /** Мастер смены */
  masterShift: string;
  /** Начальник участка */
  sectionChief: string;
  /** Оператор */
  operator: string;
}

export type EmployeeRole = "Мастер смены" | "Нач. участка" | "Оператор" | "Контролёр ОТК";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
}

export const EMPLOYEE_ROLES: EmployeeRole[] = ["Мастер смены", "Нач. участка", "Оператор", "Контролёр ОТК"];

export interface Order {
  id: string;
  number: string;
  customer: string;
  manager: string;
  createdAt: string;
  dueDate: string;
  priority: "низкий" | "обычный" | "срочный";
  status: "черновик" | "в производстве" | "выполнен";
  comment: string;
  items: OrderItem[];
  /** Момент нажатия «Запустить в производство» — с него идёт калькуляция факта */
  startedAt?: string;
  progress?: StepProgress[];
  /** Ответственные по позициям заказа: ключ — id позиции */
  assignments?: Record<string, Assignment>;
  /** Ответственные по каждому переделу: ключ — id позиции, вложенный ключ — id передела */
  stepAssignments?: Record<string, Record<string, Assignment>>;
  /** Фактический момент поступления партии на передел (кнопка «Начать операцию»): itemId → stepIndex → ISO */
  stepStarts?: Record<string, Record<number, string>>;
}


