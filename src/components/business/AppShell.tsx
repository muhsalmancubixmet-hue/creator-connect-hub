import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BarChart3,
  Bookmark,
  Building2,
  ChevronDown,
  CircleHelp,
  Compass,
  CreditCard,
  FileText,
  Film,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquare,
  Search,
  Settings,
  Menu,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import {
  CURRENCIES,
  CURRENCY_CODES,
  setDisplayCurrency,
  useDisplayCurrency,
  type CurrencyCode,
} from "@/lib/currency";
import { NotificationItem } from "./NotificationItem";
import { useAuth } from "@/lib/auth-context";
import {
  getBusinessInquiriesUnreadCount,
  getBusinessNotifications,
  type BusinessNotificationItem,
} from "@/lib/business-api";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/discover", label: "Discover Influencers", icon: Compass },
  { to: "/posts", label: "Posts & Collabs", icon: Film },
  { to: "/shortlists", label: "Shortlists", icon: Bookmark },
  { to: "/requirements", label: "Requirements", icon: FileText },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/saved-searches", label: "Saved Searches", icon: Search },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/business-profile", label: "Business Profile", icon: Building2 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const mobileNav = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/shortlists", label: "Saved", icon: Bookmark },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2">
      <span className="grid size-9 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-soft">
        <Sparkles className="size-4.5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-semibold tracking-tight">
          Influencers<span className="text-primary">.com</span>
        </span>
        <span className="block text-[11px] text-muted-foreground">Business Suite</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Query dynamic unread incoming messages count from the backend
  const { data: unreadData } = useQuery({
    queryKey: ["business-unread-count"],
    queryFn: getBusinessInquiriesUnreadCount,
    refetchInterval: 8000,
  });
  const unreadMessagesCount = unreadData?.unread_count ?? 0;

  return (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        const Icon = item.icon;
        const showBadge = item.to === "/messages" && unreadMessagesCount > 0;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className={cn("size-4.5 shrink-0", active && "text-primary")} />
            <span className="truncate">{item.label}</span>
            {showBadge ? (
              <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-accent px-1.5 text-[11px] text-accent-foreground">
                {unreadMessagesCount}
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function PlanCard() {
  const { business } = useAuth();
  const planName = business?.subscription_plan || "Free";
  return (
    <div className="rounded-2xl border border-border gradient-hero p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{planName}</p>
      <p className="mt-1 text-sm text-muted-foreground">Active workspace plan</p>
      <Button asChild size="sm" className="mt-3 w-full rounded-xl">
        <Link to="/subscription">Manage plan</Link>
      </Button>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-[272px] shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Brand />
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <NavLinks />
      </ScrollArea>
      <div className="p-3">
        <PlanCard />
      </div>
    </aside>
  );
}

function NotificationsBell() {
  const { data: notificationsList = [] } = useQuery<BusinessNotificationItem[]>({
    queryKey: ["business-notifications"],
    queryFn: getBusinessNotifications,
    refetchInterval: 15000,
  });
  const unread = notificationsList.filter((n) => !n.is_read).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] rounded-2xl p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-display text-sm font-semibold">Notifications</p>
          <Link to="/notifications" className="text-xs font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <ScrollArea className="max-h-[360px]">
          {notificationsList.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No notifications</div>
          ) : (
            <div className="divide-y divide-border">
              {notificationsList.slice(0, 5).map((n) => (
                <div key={n.id} className="p-3 text-xs">
                  <p className="font-semibold text-foreground">{n.title}</p>
                  <p className="text-muted-foreground mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function ProfileMenu() {
  const { business, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated && !business) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const name = business?.company_name || "Brand Workspace";
  const initials = name.slice(0, 2).toUpperCase();
  const email = business?.contact_email || "";
  const logo = business?.logo_url || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-card py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-secondary">
          <Avatar className="size-7 rounded-lg">
            <AvatarImage src={logo} alt={name} />
            <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate text-sm font-medium sm:block">{name}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">{name}</p>
          <p className="truncate text-[11px]">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/business-profile">
            <Building2 className="size-4" /> View Business Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings className="size-4" /> Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/subscription">
            <CreditCard className="size-4" /> Subscription
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  const [query, setQuery] = useState("");
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-xl lg:hidden">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <Brand />
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
            <NavLinks />
            <div className="mt-4">
              <PlanCard />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Link to="/" className="lg:hidden">
        <span className="grid size-9 place-items-center rounded-xl gradient-primary text-primary-foreground">
          <Sparkles className="size-4.5" />
        </span>
      </Link>

      <form
        className="relative hidden flex-1 md:block md:max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          toast(query ? `Searching for "${query}"` : "Type something to search");
        }}
      >
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators, campaigns, messages…"
          className="h-10 rounded-xl border-border bg-secondary/60 pl-9"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="rounded-xl md:hidden" asChild>
          <Link to="/discover">
            <Search className="size-5" />
          </Link>
        </Button>
        <CurrencySwitcher />
        <NotificationsBell />
        <Button
          variant="ghost"
          size="icon"
          className="hidden rounded-xl sm:inline-flex"
          onClick={() => toast("Help centre opens here")}
        >
          <CircleHelp className="size-5" />
        </Button>
        <ProfileMenu />
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">
        {mobileNav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function CurrencySwitcher() {
  const currency = useDisplayCurrency();
  return (
    <Select value={currency} onValueChange={(v) => setDisplayCurrency(v as CurrencyCode)}>
      <SelectTrigger
        aria-label="Display currency"
        className="h-9 w-[76px] rounded-xl text-xs font-medium"
      >
        <span>{currency}</span>
      </SelectTrigger>
      <SelectContent>
        {CURRENCY_CODES.map((c) => (
          <SelectItem key={c} value={c}>
            {c} · {CURRENCIES[c].name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  // Remount page content when display currency changes so all prices re-format.
  const currency = useDisplayCurrency();
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main key={currency} className="flex-1 px-4 pb-24 pt-5 lg:px-8 lg:pb-10 lg:pt-7">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-[28px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export { UserRound };
