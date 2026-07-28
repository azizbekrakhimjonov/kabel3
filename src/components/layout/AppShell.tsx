import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Search,
  Package,
  GitBranch,
  Cog,
  Boxes,
  BookMarked,
  FileSpreadsheet,
  FileText,
  Settings,
  ClipboardList,
  Cable,
  Moon,
  Sun,
  LogOut,
  Factory,
  Table2,

} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/store";

const NAV = [
  { title: "Панель управления", url: "/", icon: LayoutDashboard },
  { title: "Поиск продукции", url: "/search", icon: Search },
  { title: "Продукция", url: "/products", icon: Package },
  { title: "Заказы", url: "/orders", icon: ClipboardList },
  { title: "План-задание", url: "/plan", icon: Table2 },

  { title: "Маршруты", url: "/routes", icon: GitBranch },
  { title: "Оборудование", url: "/machines", icon: Cog },
  { title: "Материалы", url: "/materials", icon: Boxes },
  { title: "Стандарты ГОСТ/ТУ", url: "/standards", icon: BookMarked },
  { title: "Импорт Excel", url: "/import", icon: FileSpreadsheet },
  { title: "Отчёты", url: "/reports", icon: FileText },
  { title: "Схема завода", url: "/layout", icon: Factory },
  { title: "Настройки", url: "/settings", icon: Settings },
];

function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Cable className="size-5" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-display text-sm font-semibold tracking-wide text-sidebar-foreground">
              CTMS
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">Управление кабельным заводом</p>
          </div>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Разделы</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <div className="rounded-md bg-sidebar-accent p-3 text-[11px] leading-relaxed text-sidebar-accent-foreground/80">
          Смена: 2 · Цехов в работе: 5
          <br />
          Версия MES 1.4.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { theme, toggleTheme, user, logout } = useApp();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="no-print sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
              <SidebarTrigger />
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg font-semibold uppercase tracking-wide sm:text-xl">
                  {title}
                </h1>
                {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="hidden items-center gap-2 md:flex">{actions}</div>
                <Badge variant="outline" className="hidden font-mono text-[11px] lg:inline-flex">
                  {user}
                </Badge>
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Сменить тему">
                  {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Выход">
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>
            {actions && <div className="flex flex-wrap gap-2 px-4 pb-3 md:hidden">{actions}</div>}
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
