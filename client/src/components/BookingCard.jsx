import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { formatPrice, nightsBetween } from "../utils/format";
import { createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const SERVICE_FEE_RATE = 0.05;

const BookingCard = ({ property }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = nights * property.pricePerNight;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + (property.cleaningFee || 0) + serviceFee;

  const isOwnProperty = user && property.host?._id === user._id;
  const canBook = checkIn && checkOut && nights > 0 && !isOwnProperty;

  const today = new Date().toISOString().split("T")[0];

  const handleReserve = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to book this property");
      navigate("/login");
      return;
    }
    if (!canBook) {
      toast.error("Please select valid check-in and check-out dates");
      return;
    }
    if (Number(guests) > property.guests) {
      toast.error(`This property allows a maximum of ${property.guests} guests`);
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        propertyId: property._id,
        checkIn,
        checkOut,
        guests: Number(guests),
      });
      toast.success("Booking request sent! Check My Bookings for status.");
      navigate("/bookings");
    } catch (err) {
      const message = err.response?.data?.message || "Could not create booking";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

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
        disabled={submitting || isOwnProperty}
        className="btn-primary w-full justify-center"
      >
        {submitting ? "Reserving..." : isOwnProperty ? "This is your property" : "Reserve"}
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
      <p className="text-[11px] text-ink-400 mt-4">
        You won't be charged yet. This is a demo booking flow — no real payment is processed.
      </p>
    </div>
  );
};

export default BookingCard;
