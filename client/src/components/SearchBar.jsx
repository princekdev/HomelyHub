import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";

const SearchBar = ({ compact = false }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (guests) params.set("guests", guests);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white rounded-2xl shadow-cardHover p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2 ${
        compact ? "max-w-3xl" : "max-w-4xl"
      } w-full mx-auto`}
    >
      <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-ink-100">
        <MapPin size={18} className="text-brand-500 shrink-0" />
        <input
          type="text"
          placeholder="Where are you going?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full outline-none text-sm bg-transparent"
        />
      </div>
      <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-ink-100">
        <Calendar size={18} className="text-brand-500 shrink-0" />
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full outline-none text-sm bg-transparent"
          aria-label="Check-in"
        />
      </div>
      <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b md:border-b-0 md:border-r border-ink-100">
        <Calendar size={18} className="text-brand-500 shrink-0" />
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full outline-none text-sm bg-transparent"
          aria-label="Check-out"
        />
      </div>
      <div className="flex-1 flex items-center gap-2 px-3 py-2">
        <Users size={18} className="text-brand-500 shrink-0" />
        <input
          type="number"
          min="1"
          placeholder="Guests"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full outline-none text-sm bg-transparent"
        />
      </div>
      <button type="submit" className="btn-primary shrink-0 justify-center">
        <Search size={17} />
        <span className="md:hidden">Search</span>
      </button>
    </form>
  );
};

export default SearchBar;
