import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Building2, CalendarCheck2 } from "lucide-react";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/properties", label: "Properties", icon: Building2 },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck2 },
];

const AdminLayout = () => (
  <div className="container-app py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
    <aside className="lg:col-span-1">
      <div className="card-surface p-3 flex lg:flex-col gap-1 overflow-x-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? "bg-brand-50 text-brand-600" : "text-ink-600 hover:bg-ink-50"
              }`
            }
          >
            <l.icon size={16} /> {l.label}
          </NavLink>
        ))}
      </div>
    </aside>
    <div className="lg:col-span-4">
      <Outlet />
    </div>
  </div>
);

export default AdminLayout;
