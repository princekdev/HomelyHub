import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Calendar, MapPin, ShieldCheck, CreditCard,
  CheckCircle, ArrowLeft, AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getPropertyById } from "../services/propertyService";
import { createPaymentOrder, verifyPayment } from "../services/paymentService";
import { useAuth } from "../context/AuthContext";
import { formatPrice, formatDate, nightsBetween } from "../utils/format";
import Loader from "../components/Loader";

// ── small helper ──────────────────────────────────────────────────────────────
const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between text-sm ${bold ? "font-semibold pt-2 border-t border-ink-100" : "text-ink-700"}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

// ── load Razorpay SDK on demand ───────────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

// =============================================================================
const BookingPage = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const prefill = location.state || {};

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [checkIn, setCheckIn] = useState(prefill.checkIn || "");
  const [checkOut, setCheckOut] = useState(prefill.checkOut || "");
  const [guests, setGuests] = useState(prefill.guests || 1);

  const today = new Date().toISOString().split("T")[0];
  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  useEffect(() => {
    getPropertyById(propertyId)
      .then((r) => setProperty(r.data))
      .catch(() => toast.error("Property not found"))
      .finally(() => setLoading(false));
  }, [propertyId]);

  // Ownership check (same robust logic as BookingCard)
  const hostId = property?.host?._id ?? property?.host;
  const isOwnProperty =
    user && property && hostId?.toString() === user._id?.toString();

  const subtotal = nights * (property?.pricePerNight || 0);
  const serviceFee = Math.round(subtotal * 0.05);
  const cleaningFee = property?.cleaningFee || 0;
  const total = subtotal + cleaningFee + serviceFee;

  const canPay = checkIn && checkOut && nights > 0 && Number(guests) >= 1;

  // ── payment handler ───────────────────────────────────────────────────────
  const handlePay = async () => {
    if (isOwnProperty) {
      toast.error("You cannot book your own property");
      return;
    }
    if (!canPay) {
      toast.error("Please select valid dates");
      return;
    }
    if (Number(guests) > property.guests) {
      toast.error(`Max ${property.guests} guests allowed`);
      return;
    }

    setSubmitting(true);
    try {
      const orderRes = await createPaymentOrder({
        propertyId,
        checkIn,
        checkOut,
        guests: Number(guests),
      });

      const orderData = orderRes.data;

      if (orderData.mode === "demo") {
        // ── DEMO MODE (no Razorpay keys configured) ──
        await verifyPayment({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: null,
          razorpay_signature: null,
          propertyId,
          checkIn,
          checkOut,
          guests: Number(guests),
        });
        setDone(true);
        toast.success("Booking confirmed! (Demo payment)");
        return;
      }

      // ── REAL RAZORPAY ──
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Could not load payment gateway. Please try again.");
        return;
      }

      await new Promise((resolve, reject) => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount * 100,
          currency: orderData.currency || "INR",
          name: "HomelyHub",
          description: `Booking: ${orderData.propertyTitle}`,
          order_id: orderData.orderId,
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
          },
          theme: { color: "#4f46e5" },
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                propertyId,
                checkIn,
                checkOut,
                guests: Number(guests),
              });
              setDone(true);
              toast.success("Payment successful! Booking confirmed.");
              resolve();
            } catch (err) {
              toast.error(err.response?.data?.message || "Payment verification failed");
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              toast("Payment cancelled");
              resolve();
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (r) => {
          toast.error(`Payment failed: ${r.error.description}`);
          resolve();
        });
        rzp.open();
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Could not initiate payment";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── success screen ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="container-app py-16 flex flex-col items-center text-center gap-4">
        <CheckCircle size={56} className="text-emerald-500" />
        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
        <p className="text-ink-500 max-w-sm">
          Your stay at <strong>{property?.title}</strong> has been booked.
          Check <em>My Bookings</em> for details.
        </p>
        <div className="flex gap-3 mt-4">
          <Link to="/bookings" className="btn-primary">View My Bookings</Link>
          <Link to="/explore" className="btn-outline">Explore more</Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loader fullScreen />;

  if (!property) {
    return (
      <div className="container-app py-16 text-center">
        <p className="text-ink-500">Property not found.</p>
        <Link to="/explore" className="btn-primary mt-4 inline-block">Back to Explore</Link>
      </div>
    );
  }

  // ── own-property guard ────────────────────────────────────────────────────
  if (isOwnProperty) {
    return (
      <div className="container-app py-16 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
        <AlertTriangle size={48} className="text-amber-400" />
        <h1 className="text-xl font-bold">This is your property</h1>
        <p className="text-ink-500 text-sm">
          You can't book your own property. To preview the guest checkout experience,
          log in with a different (guest) account.
        </p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => navigate(-1)} className="btn-outline">Go back</button>
          <Link to="/explore" className="btn-primary">Explore other stays</Link>
        </div>
      </div>
    );
  }

  const coverImage =
    property.images?.[0]?.url ||
    `https://picsum.photos/seed/${property._id}/600/400`;

  return (
    <div className="container-app py-8 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 mb-6"
      >
        <ArrowLeft size={16} /> Back to property
      </button>

      <h1 className="text-2xl font-bold mb-6">Confirm &amp; Pay</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Left: trip details + payment ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Trip dates */}
          <section className="card-surface p-5 space-y-4">
            <h2 className="font-semibold text-base">Your trip</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-ink-200 rounded-xl p-3">
                <label className="text-[10px] uppercase text-ink-500 font-medium block mb-1">
                  Check-in
                </label>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-sm outline-none"
                />
              </div>
              <div className="border border-ink-200 rounded-xl p-3">
                <label className="text-[10px] uppercase text-ink-500 font-medium block mb-1">
                  Check-out
                </label>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-sm outline-none"
                />
              </div>
            </div>

            <div className="border border-ink-200 rounded-xl p-3">
              <label className="text-[10px] uppercase text-ink-500 font-medium block mb-1">
                Guests
              </label>
              <input
                type="number"
                min="1"
                max={property.guests}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full text-sm outline-none"
              />
            </div>

            {nights > 0 && (
              <p className="text-sm text-ink-500 flex items-center gap-1">
                <Calendar size={13} />
                {formatDate(checkIn)} → {formatDate(checkOut)} ·{" "}
                <strong>{nights} night{nights > 1 ? "s" : ""}</strong>
              </p>
            )}
          </section>

          {/* Guest info */}
          <section className="card-surface p-5">
            <h2 className="font-semibold text-base mb-3">Guest</h2>
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatar?.url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "U"
                  )}&background=4f46e5&color=fff`
                }
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-ink-500">{user?.email}</p>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="card-surface p-5 space-y-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <CreditCard size={16} /> Payment
            </h2>

            <div className="flex items-start gap-2 bg-blue-50 text-blue-700 rounded-xl px-4 py-3 text-xs">
              <ShieldCheck size={14} className="shrink-0 mt-0.5" />
              <span>
                Your payment is secured. No amount is charged until you confirm below.
              </span>
            </div>

            <button
              onClick={handlePay}
              disabled={submitting || !canPay}
              className="btn-primary w-full justify-center text-base py-3"
            >
              {submitting
                ? "Processing…"
                : `Confirm & Pay${nights > 0 ? ` ${formatPrice(total)}` : ""}`}
            </button>

            <p className="text-[11px] text-ink-400 text-center">
              By clicking above you agree to HomelyHub's guest terms.
            </p>
          </section>
        </div>

        {/* ── Right: property summary ── */}
        <div className="lg:col-span-2">
          <div className="card-surface p-0 overflow-hidden lg:sticky lg:top-24">
            <img
              src={coverImage}
              alt={property.title}
              className="w-full h-44 object-cover"
            />
            <div className="p-5 space-y-4">
              <div>
                <p className="font-semibold text-sm">{property.title}</p>
                <p className="text-xs text-ink-500 flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {property.location?.city},{" "}
                  {property.location?.state}
                </p>
              </div>

              <div className="border-t border-ink-100 pt-4 space-y-2">
                <h3 className="text-sm font-semibold mb-2">Price breakdown</h3>
                {nights > 0 ? (
                  <>
                    <Row
                      label={`${formatPrice(property.pricePerNight)} × ${nights} night${nights > 1 ? "s" : ""}`}
                      value={formatPrice(subtotal)}
                    />
                    {cleaningFee > 0 && (
                      <Row label="Cleaning fee" value={formatPrice(cleaningFee)} />
                    )}
                    <Row label="Service fee (5%)" value={formatPrice(serviceFee)} />
                    <Row label="Total" value={formatPrice(total)} bold />
                  </>
                ) : (
                  <p className="text-xs text-ink-400">
                    Select dates to see the price breakdown.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
