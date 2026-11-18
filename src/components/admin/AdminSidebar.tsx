import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Contact,
  FileText,
  GalleryVerticalEnd,
  X,
  LayoutDashboard,
  MapPin,
  MessageSquareText,
  Mic2,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "../layout/Logo";
import { hasPermission, useAuth } from "../../lib/auth";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const items = [
  { title: "Overview", path: "/admin", icon: LayoutDashboard, permissionKey: "overview", group: "Workspace" },
  { title: "Transactions", path: "/admin/transactions", icon: Receipt, permissionKey: "transactions", group: "Workspace" },
  { title: "Site Analytics", path: "/admin/analytics", icon: BarChart3, permissionKey: "analytics", group: "Workspace" },
  { title: "Overseers Directory", path: "/admin/directory", icon: Contact, permissionKey: "directory", group: "Workspace" },
  { title: "Site content", path: "/admin/content", icon: FileText, permissionKey: "content", group: "Publishing" },
  { title: "Sermons", path: "/admin/sermons", icon: Mic2, permissionKey: "sermons", group: "Publishing" },
  { title: "Devotionals", path: "/admin/devotionals", icon: BookOpen, permissionKey: "devotionals", group: "Publishing" },
  { title: "Events", path: "/admin/events", icon: CalendarDays, permissionKey: "events", group: "Publishing" },
  { title: "Blog & comments", path: "/admin/blog", icon: MessageSquareText, permissionKey: "blog", group: "Publishing" },
  { title: "Publications", path: "/admin/bookstore", icon: BookOpen, permissionKey: "bookstore", group: "Publishing" },
  { title: "Gallery", path: "/admin/gallery", icon: GalleryVerticalEnd, permissionKey: "gallery", group: "Publishing" },
  { title: "Locations", path: "/admin/locations", icon: MapPin, permissionKey: "locations", group: "Ministry" },
  { title: "Donation Funds", path: "/admin/donations", icon: Wallet, permissionKey: "donations", group: "Ministry" },
  { title: "Administrators", path: "/admin/users", icon: Users, permissionKey: "users", group: "System" },
  { title: "Settings", path: "/admin/settings", icon: Settings, permissionKey: "settings", group: "System" },
];

export default function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const { user } = useAuth();
  const visibleItems = items.filter((item) => hasPermission(user, item.permissionKey));
  const visibleGroups = [...new Set(visibleItems.map((item) => item.group))];

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Dismiss navigation overlay"
          className="fixed inset-0 z-40 bg-[#071523]/60 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[272px] flex-col border-r border-white/10 bg-[#0b1c2d] text-white shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-40 lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        id="admin-navigation"
      >
      <div className="flex h-[66px] shrink-0 items-center justify-between border-b border-white/10 px-4 lg:h-[78px] lg:px-5">
        <div className="rounded-lg bg-white px-2.5 py-1.5">
          <Logo size="sm" />
        </div>
        <button
          aria-label="Close navigation drawer"
          className="grid size-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <nav
        aria-label="Administration"
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-3.5 py-6"
      >
        {visibleGroups.map((group) => (
          <div className="flex flex-col gap-1" key={group}>
            <p className="px-3 pb-1 text-[9px] font-bold uppercase tracking-[.18em] text-slate-500">
              {group}
            </p>
            {visibleItems
              .filter((item) => item.group === group)
              .map(({ title, path, icon: Icon }) => (
                <NavLink
                  className={({ isActive }) =>
                    `group relative flex min-h-10 w-full shrink-0 items-center gap-3 rounded-lg px-3 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-white/10 text-white shadow-sm before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-[#d9ba70]"
                        : "text-slate-300 hover:bg-white/[.06] hover:text-white"
                    }`
                  }
                  end={path === "/admin"}
                  key={path}
                  onClick={onClose}
                  to={path}
                >
                  <Icon className="shrink-0 text-[#d9ba70]/90" size={15} />
                  <span>{title}</span>
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <div className="hidden border-t border-white/10 bg-white/[.03] p-4 lg:block">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#d9ba70]/30 bg-[#d9ba70]/10 text-xs font-bold text-[#e7d29d]">
            {user?.first_name ? user.first_name[0] : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-white">
              {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Administrator"}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-slate-400">
              <ShieldCheck size={10} className="text-[#d9ba70]" />
              {user?.role || "SUPERADMIN"}
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
