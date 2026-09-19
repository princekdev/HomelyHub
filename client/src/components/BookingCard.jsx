import { useMemo, useState } from "react";
import { formatPrice, nightsBetween } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, ShieldCheck } from "lucide-react";

const SERVICE_FEE_RATE = 0.05;

const BookingCard = ({ property }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = nights * property.pricePerNight;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + (property.cleaningFee || 0) + serviceFee;

  const today = new Date().toISOString().split("T")[0];

  // Robust comparison — host may be a populated object OR a raw ObjectId string
  const hostId = property.host?._id ?? property.host;
  const isOwnProperty =
    isAuthenticated && user && hostId?.toString() === user._id?.toString();

  const handleReserve = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to book this property");
      navigate("/login");
      return;
    }
    if (!checkIn || !checkOut || nights <= 0) {
      toast.error("Please select valid check-in and check-out dates");
      return;
    }
    if (Number(guests) > property.guests) {
      toast.error(`This property allows a maximum of ${property.guests} guests`);
      return;
    }
    navigate(`/checkout/${property._id}`, {
      state: { checkIn, checkOut, guests: Number(guests) },
    });
  };

  // ── Host/Admin preview panel ──────────────────────────────────────────────
  if (isOwnProperty) {
    return (
      <div className="card-surface p-5 lg:sticky lg:top-24 space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xl font-semibold">
            {formatPrice(property.pricePerNight)}
            <span className="text-sm font-normal text-ink-500"> / night</span>
          </p>
        </div>

        <div className="rounded-xl bg-ink-50 border border-ink-200 px-4 py-3 text-sm text-ink-600 flex items-start gap-2">
          <Eye size={15} className="shrink-0 mt-0.5 text-ink-400" />
          <span>
            <span className="font-medium text-ink-800">This is your property.</span>{" "}
            Guests will see a full booking &amp; payment form here.
          </span>
        </div>

        <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 text-xs text-brand-700 flex items-start gap-2">
          <ShieldCheck size={13} className="shrink-0 mt-0.5" />
          <span>
            To test the booking flow, log in with a guest account (e.g.{" "}
            <strong>priya@homelyhub.com</strong>) and visit this property.
          </span>
        </div>

        <div className="text-xs text-ink-400 border-t border-ink-100 pt-3 space-y-1">
          <div className="flex justify-between">
            <span>Price per night</span>
            <span>{formatPrice(property.pricePerNight)}</span>
          </div>
          {property.cleaningFee > 0 && (
            <div className="flex justify-between">
              <span>Cleaning fee</span>
              <span>{formatPrice(property.cleaningFee)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Service fee (5%)</span>
            <span>calculated at checkout</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Guest booking panel ───────────────────────────────────────────────────
  return (
    <div className="card-surface p-5 lg:sticky lg:top-24">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-xl font-semibold">
          {formatPrice(property.pricePerNight)}
          <span className="text-sm font-normal text-ink-500"> / night</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="border border-ink-200 rounded-xl p-2">
          <label className="text-[10px] uppercase text-ink-500 font-medium">Check-in</label>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full text-sm outline-none"
          />
        </div>
        <div className="border border-ink-200 rounded-xl p-2">
          <label className="text-[10px] uppercase text-ink-500 font-medium">Check-out</label>
          <input
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full text-sm outline-none"
          />
        </div>
      </div>

      <div className="border border-ink-200 rounded-xl p-2 mb-4">
        <label className="text-[10px] uppercase text-ink-500 font-medium">Guests</label>
        <input
          type="number"
          min="1"
          max={property.guests}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full text-sm outline-none"
        />
      </div>

      <button
        onClick={handleReserve}
        className="btn-primary w-full justify-center"
      >
        Reserve
      </button>

      {nights > 0 && (
        <div className="mt-5 space-y-2 text-sm text-ink-700">
          <div className="flex justify-between">
            <span>{formatPrice(property.pricePerNight)} × {nights} night{nights > 1 ? "s" : ""}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {property.cleaningFee > 0 && (
            <div className="flex justify-between">
              <span>Cleaning fee</span>
              <span>{formatPrice(property.cleaningFee)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Service fee</span>
            <span>{formatPrice(serviceFee)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-ink-100">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}
      <p className="text-[11px] text-ink-400 mt-4 text-center">
        You won't be charged until you confirm on the next step.
      </p>
    </div>
  );
};

export default BookingCard;
