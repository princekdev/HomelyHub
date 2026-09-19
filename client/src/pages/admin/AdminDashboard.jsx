import { useEffect, useState } from "react";
import { Users, Building2, CalendarCheck2, Wallet, UserCheck } from "lucide-react";
import { getAdminStats } from "../../services/adminService";
import { formatPrice } from "../../utils/format";
import Loader from "../../components/Loader";

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card-surface p-5 flex items-center gap-4">
    <div className="p-3 rounded-xl bg-brand-50 text-brand-500">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-ink-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch (err) {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={UserCheck} label="Total Hosts" value={stats.totalHosts} />
        <StatCard icon={Building2} label="Total Properties" value={stats.totalProperties} />
        <StatCard icon={CalendarCheck2} label="Total Bookings" value={stats.totalBookings} />
        <StatCard icon={Wallet} label="Total Revenue" value={formatPrice(stats.totalRevenue)} />
      </div>
    </div>
  );
};

export default AdminDashboard;
