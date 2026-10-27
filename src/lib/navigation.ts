import {
  BadgePercent,
  BarChart3,
  Bike,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Database,
  FileCheck2,
  FileClock,
  FileText,
  Image,
  IndianRupee,
  LayoutDashboard,
  type LucideIcon,
  MessageSquareWarning,
  Package,
  Plug,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Tags,
  Undo2,
  Upload,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  Wrench,
} from "lucide-react"

import { can, type Permission } from "@/features/auth/permissions"
import { isEnabled, type FeatureSwitch } from "@/lib/features"

/** Where admins land after signing in. */
export const HOME_ROUTE = "/dashboard"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  permission: Permission
  /** Hidden from the menu while this switch is off. The route itself still works. */
  feature?: FeatureSwitch
}

export type NavSection = { label: string; items: NavItem[] }

/** The whole menu. A new module adds one item here and nothing else. */
const NAVIGATION: NavSection[] = [
  {
    label: "Home",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/orders", icon: ShoppingCart, permission: "orders.view" },
      { label: "Returns", href: "/returns", icon: Undo2, permission: "returns.view" },
      { label: "Payments", href: "/payments", icon: IndianRupee, permission: "payments.view" },
      {
        label: "Credit notes",
        href: "/credit-notes",
        icon: ReceiptText,
        permission: "creditNotes.view",
      },
      { label: "Quotations", href: "/quotations", icon: FileText, permission: "quotations.view" },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Products", href: "/products", icon: Package, permission: "catalog.view" },
      { label: "CSV import", href: "/products/import", icon: Upload, permission: "catalog.manage" },
      { label: "Stock", href: "/stock", icon: Warehouse, permission: "stock.view" },
      {
        label: "B2B pricing",
        href: "/products/b2b-pricing",
        icon: Tags,
        permission: "pricing.view",
      },
      { label: "Masters", href: "/masters", icon: Database, permission: "masters.view" },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", href: "/customers", icon: Users, permission: "customers.view" },
      { label: "Vehicles", href: "/vehicles", icon: Bike, permission: "vehicles.view" },
    ],
  },
  {
    label: "B2B",
    items: [
      {
        label: "Applications",
        href: "/applications",
        icon: FileCheck2,
        permission: "businesses.view",
      },
      { label: "Businesses", href: "/businesses", icon: Store, permission: "businesses.view" },
      { label: "Credit accounts", href: "/credit", icon: CreditCard, permission: "credit.view" },
    ],
  },
  {
    label: "Service",
    items: [
      { label: "Garages", href: "/garages", icon: Wrench, permission: "garages.view" },
      { label: "Bookings", href: "/bookings", icon: CalendarCheck, permission: "bookings.view" },
      { label: "Job cards", href: "/job-cards", icon: ClipboardList, permission: "jobCards.view" },
      {
        label: "Garage payouts",
        href: "/garages/payouts",
        icon: Wallet,
        permission: "payouts.view",
        feature: "garagePayouts",
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Banners", href: "/content/banners", icon: Image, permission: "content.view" },
      { label: "Featured", href: "/content/featured", icon: Sparkles, permission: "content.view" },
      {
        label: "Pages and FAQ",
        href: "/content/pages",
        icon: FileText,
        permission: "content.view",
      },
      {
        label: "Coupons",
        href: "/coupons",
        icon: BadgePercent,
        permission: "coupons.view",
        feature: "coupons",
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        label: "Enquiries",
        href: "/enquiries",
        icon: MessageSquareWarning,
        permission: "enquiries.view",
      },
      { label: "Reviews", href: "/reviews", icon: Star, permission: "reviews.view" },
    ],
  },
  {
    label: "Insights",
    items: [{ label: "Reports", href: "/reports", icon: BarChart3, permission: "reports.view" }],
  },
  {
    label: "Administration",
    items: [
      { label: "Admin users", href: "/admin-users", icon: UserCog, permission: "adminUsers.view" },
      { label: "Roles", href: "/admin-users/roles", icon: ShieldCheck, permission: "roles.view" },
      { label: "Audit log", href: "/audit-log", icon: FileClock, permission: "auditLog.view" },
      { label: "Settings", href: "/settings", icon: Settings, permission: "settings.view" },
      {
        label: "Integrations",
        href: "/settings/integrations",
        icon: Plug,
        permission: "integrations.view",
      },
    ],
  },
]

/** The menu an admin may see: filtered by their permissions and by feature switches. */
export function visibleNavigation(permissions: readonly Permission[]): NavSection[] {
  return NAVIGATION.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => can({ permissions }, item.permission) && (!item.feature || isEnabled(item.feature)),
    ),
  })).filter((section) => section.items.length > 0)
}

/** The most specific menu item for a path, so "/orders/ord_001" highlights "Orders". */
export function activeHref(pathname: string): string | undefined {
  return NAVIGATION.flatMap((section) => section.items)
    .map((item) => item.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0]
}
