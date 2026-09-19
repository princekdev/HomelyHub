import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Users } from "lucide-react";
import { getHostBookings, updateBookingStatus } from "../../services/bookingService";
import { formatDate, formatPrice, statusColor } from "../../utils/format";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getHostBookings();
      setBookings(res.data);
    } catch (err) {
      toast.error("Could not load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id, status) => {
    setActingId(id);
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update booking");
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings for Your Properties</h1>

      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" message="Bookings for your properties will appear here." />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="card-surface p-4 flex flex-col sm:flex-row gap-4">
              <img
                src={b.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.user?.name || "G")}&background=f6402a&color=fff`}
                alt={b.user?.name}
                className="w-14 h-14 rounded-full object-cover shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{b.user?.name}</p>
                    <Link to={`/properties/${b.property?._id}`} className="text-sm text-ink-500 hover:text-brand-600">
                      {b.property?.title}
                    </Link>
                  </div>
                  <span className={`badge capitalize ${statusColor(b.status)}`}>{b.status}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-ink-600 mt-3">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span>
                  <span className="flex items-center gap-1"><Users size={13} /> {b.guests} guests</span>
                  <span className="font-medium text-ink-900">{formatPrice(b.totalPrice)}</span>
                </div>
                {b.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      disabled={actingId === b._id}
                      onClick={() => handleStatusChange(b._id, "confirmed")}
                      className="btn-primary text-sm py-1.5 px-3"
                    >
                      Confirm
                    </button>
                    <button
                      disabled={actingId === b._id}
                      onClick={() => handleStatusChange(b._id, "rejected")}
                      className="btn-outline text-sm py-1.5 px-3 text-red-600"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {b.status === "confirmed" && new Date(b.checkOut) < new Date() && (
                  <div className="flex gap-2 mt-3">
                    <button
                      disabled={actingId === b._id}
                      onClick={() => handleStatusChange(b._id, "completed")}
                      className="btn-outline text-sm py-1.5 px-3"
                    >
                      Mark as completed
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostBookings;
