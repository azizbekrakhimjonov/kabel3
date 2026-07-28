import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Assignment, Employee, EmployeeRole, Order, OrderItem, StepProgress } from "./types";
import { PRODUCTS } from "./data/products";

export interface ImportedRow {
  id: string;
  model: string;
  size: string;
  lengthM: number;
  customer: string;
  matchedProductId: string | null;
}

interface AppState {
  authed: boolean;
  user: string;
  login: (user: string) => void;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  recent: Array<{ model: string; size: string; at: string }>;
  pushRecent: (model: string, size: string) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  startProduction: (id: string) => void;
  completeStep: (
    id: string,
    entry: Omit<StepProgress, "startedAt" | "finishedAt"> & { startedAt?: string },
  ) => void;
  undoStep: (id: string, itemId: string, stepIndex: number) => void;
  markStepStart: (id: string, itemId: string, stepIndex: number) => void;
  setAssignment: (orderId: string, itemId: string, patch: Partial<Assignment>) => void;
  setStepAssignment: (orderId: string, itemId: string, processId: string, patch: Partial<Assignment>) => void;

  removeOrder: (id: string) => void;
  imported: ImportedRow[];
  setImported: (rows: ImportedRow[]) => void;

  employees: Employee[];
  addEmployee: (name: string, role: EmployeeRole) => void;
  removeEmployee: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const seedItems = (spec: Array<[string, number]>): OrderItem[] =>
  spec.map(([productId, lengthM], i) => ({
    id: `it-${productId}-${i}`,
    productId,
    lengthM,
    drums: 0,
  }));

const SEED_ORDERS: Order[] = [
  {
    id: "ord-1",
    number: "ЗК-2024/0147",
    customer: 'АО "Узбекэнерго" — филиал Ташкентские электросети',
    manager: "Р. Каримов",
    createdAt: "2024-06-03",
    dueDate: "2024-06-24",
    priority: "срочный",
    status: "в производстве",
    comment: "Барабаны №14, маркировка заказчика на бирке обязательна.",
    items: seedItems([
      [PRODUCTS[2]?.id ?? "prd-003", 4200],
      [PRODUCTS[24]?.id ?? "prd-025", 1800],
    ]),
  },
  {
    id: "ord-2",
    number: "ЗК-2024/0152",
    customer: 'ООО "Ташкент Метрокурилиш"',
    manager: "Д. Юсупова",
    createdAt: "2024-06-08",
    dueDate: "2024-07-02",
    priority: "обычный",
    status: "черновик",
    comment: "Требуется протокол испытаний на нераспространение горения.",
    items: seedItems([[PRODUCTS[0]?.id ?? "prd-001", 2500]]),
  },
];

const SEED_EMPLOYEES: Employee[] = [
  { id: "emp-1", name: "Баходир Каримов", role: "Мастер смены" },
  { id: "emp-2", name: "Улуғбек Сафаров", role: "Мастер смены" },
  { id: "emp-3", name: "Жавлон Тошев", role: "Нач. участка" },
  { id: "emp-4", name: "Дилшод Норов", role: "Нач. участка" },
  { id: "emp-5", name: "Азизбек Юсупов", role: "Оператор" },
  { id: "emp-6", name: "Одил Раҳимов", role: "Оператор" },
  { id: "emp-7", name: "Жамшид Эргашев", role: "Оператор" },
  { id: "emp-8", name: "И. Абдуллаев", role: "Контролёр ОТК" },
  { id: "emp-9", name: "М. Юлдашева", role: "Контролёр ОТК" },
];

function usePersisted<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* игнорируем повреждённые данные */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* хранилище недоступно */
    }
  }, [key, value, hydrated]);

  return [value, setValue] as const;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = usePersisted("ctms.authed", false);
  const [user, setUser] = usePersisted("ctms.user", "Оператор");
  const [theme, setTheme] = usePersisted<"light" | "dark">("ctms.theme", "light");
  const [favorites, setFavorites] = usePersisted<string[]>("ctms.favorites", [
    PRODUCTS[2]?.id ?? "prd-003",
    PRODUCTS[10]?.id ?? "prd-011",
  ]);
  const [recent, setRecent] = usePersisted<Array<{ model: string; size: string; at: string }>>(
    "ctms.recent",
    [
      { model: "КВВГЭнг(А)", size: "10x1.5", at: "сегодня, 09:14" },
      { model: "ВВГнг(А)-LS", size: "4x6", at: "сегодня, 08:42" },
      { model: "ВБбШв", size: "4x16", at: "вчера, 16:05" },
    ],
  );
  const [orders, setOrders] = usePersisted<Order[]>("ctms.orders", SEED_ORDERS);
  const [imported, setImported] = usePersisted<ImportedRow[]>("ctms.imported", []);
  const [employees, setEmployees] = usePersisted<Employee[]>("ctms.employees", SEED_EMPLOYEES);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo<AppState>(
    () => ({
      authed,
      user,
      login: (u: string) => {
        setUser(u || "Оператор");
        setAuthed(true);
      },
      logout: () => setAuthed(false),
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      favorites,
      toggleFavorite: (id: string) =>
        setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
      recent,
      pushRecent: (model: string, size: string) =>
        setRecent((r) =>
          [
            { model, size, at: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) },
            ...r.filter((x) => !(x.model === model && x.size === size)),
          ].slice(0, 8),
        ),
      orders,
      addOrder: (order: Order) => setOrders((o) => [order, ...o]),
      updateOrderStatus: (id, status) =>
        setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x))),
      startProduction: (id) =>
        setOrders((o) =>
          o.map((x) =>
            x.id === id
              ? {
                  ...x,
                  status: "в производстве",
                  startedAt: x.startedAt ?? new Date().toISOString(),
                  progress: x.progress ?? [],
                }
              : x,
          ),
        ),
      completeStep: (id, entry) =>
        setOrders((o) =>
          o.map((x) => {
            if (x.id !== id) return x;
            const prev = x.progress ?? [];
            const last = prev
              .filter((p) => p.itemId === entry.itemId)
              .sort((a, b) => a.stepIndex - b.stepIndex)
              .at(-1);
            const startedAt =
              entry.startedAt ?? x.stepStarts?.[entry.itemId]?.[entry.stepIndex] ?? last?.finishedAt ?? x.startedAt ?? new Date().toISOString();
            const record: StepProgress = {
              itemId: entry.itemId,
              stepIndex: entry.stepIndex,
              operator: entry.operator,
              otk: entry.otk,
              masterShift: entry.masterShift,
              sectionChief: entry.sectionChief,
              note: entry.note,
              startedAt,
              finishedAt: new Date().toISOString(),
            };
            const itemStarts = { ...(x.stepStarts?.[entry.itemId] ?? {}) };
            delete itemStarts[entry.stepIndex];
            return {
              ...x,
              progress: [...prev.filter((p) => !(p.itemId === entry.itemId && p.stepIndex === entry.stepIndex)), record],
              stepStarts: { ...(x.stepStarts ?? {}), [entry.itemId]: itemStarts },
            };
          }),
        ),
      markStepStart: (id, itemId, stepIndex) =>
        setOrders((o) =>
          o.map((x) =>
            x.id === id
              ? {
                  ...x,
                  stepStarts: {
                    ...(x.stepStarts ?? {}),
                    [itemId]: {
                      ...(x.stepStarts?.[itemId] ?? {}),
                      [stepIndex]: x.stepStarts?.[itemId]?.[stepIndex] ?? new Date().toISOString(),
                    },
                  },
                }
              : x,
          ),
        ),
      undoStep: (id, itemId, stepIndex) =>
        setOrders((o) =>
          o.map((x) => {
            if (x.id !== id) return x;
            const itemStarts = { ...(x.stepStarts?.[itemId] ?? {}) };
            for (const key of Object.keys(itemStarts)) if (Number(key) >= stepIndex) delete itemStarts[Number(key)];
            return {
              ...x,
              progress: (x.progress ?? []).filter((p) => !(p.itemId === itemId && p.stepIndex >= stepIndex)),
              stepStarts: { ...(x.stepStarts ?? {}), [itemId]: itemStarts },
            };
          }),
        ),
      setAssignment: (orderId, itemId, patch) =>
        setOrders((o) =>
          o.map((x) =>
            x.id === orderId
              ? {
                  ...x,
                  assignments: {
                    ...(x.assignments ?? {}),
                    [itemId]: {
                      masterShift: "",
                      sectionChief: "",
                      operator: "",
                      ...(x.assignments?.[itemId] ?? {}),
                      ...patch,
                    },
                  },
                }
              : x,
          ),
        ),
      setStepAssignment: (orderId, itemId, processId, patch) =>
        setOrders((o) =>
          o.map((x) =>
            x.id === orderId
              ? {
                  ...x,
                  stepAssignments: {
                    ...(x.stepAssignments ?? {}),
                    [itemId]: {
                      ...(x.stepAssignments?.[itemId] ?? {}),
                      [processId]: {
                        masterShift: "",
                        sectionChief: "",
                        operator: "",
                        ...(x.stepAssignments?.[itemId]?.[processId] ?? {}),
                        ...patch,
                      },
                    },
                  },
                }
              : x,
          ),
        ),

      removeOrder: (id) => setOrders((o) => o.filter((x) => x.id !== id)),
      imported,
      setImported,

      employees,
      addEmployee: (name, role) =>
        setEmployees((e) => [...e, { id: `emp-${Date.now()}`, name: name.trim(), role }]),
      removeEmployee: (id) => setEmployees((e) => e.filter((x) => x.id !== id)),
    }),
    [
      authed,
      user,
      theme,
      favorites,
      recent,
      orders,
      imported,
      employees,
      setAuthed,
      setUser,
      setTheme,
      setFavorites,
      setRecent,
      setOrders,
      setImported,
      setEmployees,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp должен использоваться внутри AppProvider");
  return ctx;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export const useStableCallback = useCallback;
