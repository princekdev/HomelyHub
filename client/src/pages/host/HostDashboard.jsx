import { useEffect, useState } from "react";
import { Building2, CalendarCheck2, Clock, CheckCircle2, Wallet } from "lucide-react";
import { getMyProperties } from "../../services/propertyService";
import { getHostBookings } from "../../services/bookingService";
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

const HostDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    upcoming: 0,
    completed: 0,
    earnings: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [propsRes, bookingsRes] = await Promise.all([getMyProperties(), getHostBookings()]);
        const properties = propsRes.data;
        const bookings = bookingsRes.data;
        const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length;
        const completed = bookings.filter((b) => b.status === "completed").length;
        const earnings = bookings
          .filter((b) => ["confirmed", "completed"].includes(b.status))
          .reduce((sum, b) => sum + b.totalPrice, 0);

        setStats({
          totalProperties: properties.length,
          totalBookings: bookings.length,
          upcoming,
          completed,
          earnings,
        });
      } catch (err) {
        // fail silently, stats default to 0
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Host Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Building2} label="Total Properties" value={stats.totalProperties} />
        <StatCard icon={CalendarCheck2} label="Total Bookings" value={stats.totalBookings} />
        <StatCard icon={Clock} label="Upcoming Bookings" value={stats.upcoming} />
        <StatCard icon={CheckCircle2} label="Completed Stays" value={stats.completed} />
        <StatCard icon={Wallet} label="Total Earnings" value={formatPrice(stats.earnings)} />
      </div>
    </div>
  );
};

export default HostDashboard;
