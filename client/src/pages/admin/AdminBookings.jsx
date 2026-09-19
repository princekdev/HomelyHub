import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAdminBookings } from "../../services/adminService";
import { formatDate, formatPrice, statusColor } from "../../utils/format";
import Loader from "../../components/Loader";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminBookings();
        setBookings(res.data);
      } catch (err) {
        toast.error("Could not load bookings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>
      <div className="card-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-500 text-left">
            <tr>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Host</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-t border-ink-100">
                <td className="px-4 py-3 font-medium">{b.property?.title}</td>
                <td className="px-4 py-3 text-ink-600">{b.user?.name}</td>
                <td className="px-4 py-3 text-ink-600">{b.host?.name}</td>
                <td className="px-4 py-3 text-ink-500">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</td>
                <td className="px-4 py-3">{formatPrice(b.totalPrice)}</td>
                <td className="px-4 py-3">
                  <span className={`badge capitalize ${statusColor(b.status)}`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;
