import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Order, OrderItem } from "./types";
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
  removeOrder: (id: string) => void;
  imported: ImportedRow[];
  setImported: (rows: ImportedRow[]) => void;
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
      removeOrder: (id) => setOrders((o) => o.filter((x) => x.id !== id)),
      imported,
      setImported,
    }),
    [authed, user, theme, favorites, recent, orders, imported, setAuthed, setUser, setTheme, setFavorites, setRecent, setOrders, setImported],
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
