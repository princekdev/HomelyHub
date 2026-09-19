import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Users, MapPin, CreditCard } from "lucide-react";
import { getMyBookings, updateBookingStatus } from "../services/bookingService";
import { submitReview } from "../services/propertyService";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import RatingStars from "../components/RatingStars";
import { formatDate, formatPrice, statusColor } from "../utils/format";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch (err) {
      toast.error("Could not load your bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking? This cannot be undone.")) return;
    try {
      await updateBookingStatus(id, "cancelled");
      toast.success("Booking cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel booking");
    }
  };

  const handleReviewSubmit = async () => {
    if (!comment.trim()) {
      toast.error("Please write a short review");
      return;
    }
    setSubmitting(true);
    try {
      await submitReview(reviewBooking.property._id, {
        rating,
        comment,
        bookingId: reviewBooking._id,
      });
      toast.success("Review submitted, thank you!");
      setReviewBooking(null);
      setComment("");
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const upcoming = bookings.filter((b) => ["pending", "confirmed"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "cancelled", "rejected"].includes(b.status));
  const list = tab === "upcoming" ? upcoming : past;

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      <div className="flex gap-2 mb-6 border-b border-ink-100">
        {["upcoming", "previous"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
              tab === t ? "border-brand-500 text-brand-600" : "border-transparent text-ink-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={`No ${tab} bookings`}
          message={tab === "upcoming" ? "Time to plan your next trip!" : "Your completed and cancelled bookings will show here."}
          action={<Link to="/explore" className="btn-primary">Explore stays</Link>}
        />
      ) : (
        <div className="space-y-4">
          {list.map((b) => (
            <div key={b._id} className="card-surface p-4 flex flex-col sm:flex-row gap-4">
              <img
                src={b.property?.images?.[0]?.url || `https://picsum.photos/seed/${b.property?._id || b._id}/300/200`}
                alt={b.property?.title}
                className="w-full sm:w-40 h-32 object-cover rounded-xl"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/properties/${b.property?._id}`} className="font-semibold hover:text-brand-600">
                      {b.property?.title}
                    </Link>
                    <p className="text-xs text-ink-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {b.property?.location?.city}, {b.property?.location?.state}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge capitalize ${statusColor(b.status)}`}>{b.status}</span>
                    {b.paymentStatus && b.paymentStatus !== "pending" && (
                      <span className={`badge text-[10px] flex items-center gap-1 ${
                        b.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700"
                        : b.paymentStatus === "demo_paid" ? "bg-purple-100 text-purple-700"
                        : "bg-red-100 text-red-700"
                      }`}>
                        <CreditCard size={10} />
                        {b.paymentStatus === "paid" ? "Paid" : b.paymentStatus === "demo_paid" ? "Demo paid" : b.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-ink-600 mt-3">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span>
                  <span className="flex items-center gap-1"><Users size={13} /> {b.guests} guests</span>
                  <span className="font-medium text-ink-900">{formatPrice(b.totalPrice)}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {["pending", "confirmed"].includes(b.status) && (
                    <button onClick={() => handleCancel(b._id)} className="btn-outline text-sm py-1.5 px-3 text-red-600">
                      Cancel booking
                    </button>
                  )}
                  {b.status === "completed" && (
                    <button
                      onClick={() => setReviewBooking(b)}
                      className="btn-outline text-sm py-1.5 px-3"
                    >
                      Leave a review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!reviewBooking} onClose={() => setReviewBooking(null)} title="Leave a review">
        <p className="text-sm text-ink-500 mb-3">How was your stay at {reviewBooking?.property?.title}?</p>
        <RatingStars rating={rating} interactive size={26} onChange={setRating} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share details about your experience..."
          className="input-field mt-4"
        />
        <button onClick={handleReviewSubmit} disabled={submitting} className="btn-primary w-full justify-center mt-4">
          {submitting ? "Submitting..." : "Submit review"}
        </button>
      </Modal>
    </div>
  );
};

export default MyBookings;
