import { PROPERTY_TYPES, AMENITIES } from "../utils/constants";
import { X } from "lucide-react";

const FilterPanel = ({ filters, setFilters, onApply, onClear }) => {
  const toggleArrayValue = (key, value) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  return (
    <div className="card-surface p-5 space-y-6 sticky top-20">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <button onClick={onClear} className="text-xs text-brand-600 flex items-center gap-1 hover:underline">
          <X size={12} /> Clear all
        </button>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Price per night (₹)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
            className="input-field text-sm"
          />
          <span className="text-ink-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
            className="input-field text-sm"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Property type</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleArrayValue("propertyType", type)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                (filters.propertyType || []).includes(type)
                  ? "bg-brand-500 border-brand-500 text-white"
                  : "border-ink-200 text-ink-600 hover:border-brand-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Guests</p>
        <input
          type="number"
          min="1"
          placeholder="Number of guests"
          value={filters.guests || ""}
          onChange={(e) => setFilters((p) => ({ ...p, guests: e.target.value }))}
          className="input-field text-sm"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Bedrooms</p>
        <input
          type="number"
          min="0"
          placeholder="Minimum bedrooms"
          value={filters.bedrooms || ""}
          onChange={(e) => setFilters((p) => ({ ...p, bedrooms: e.target.value }))}
          className="input-field text-sm"
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleArrayValue("amenities", a)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                (filters.amenities || []).includes(a)
                  ? "bg-brand-500 border-brand-500 text-white"
                  : "border-ink-200 text-ink-600 hover:border-brand-300"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onApply} className="btn-primary w-full justify-center">
        Apply Filters
      </button>
    </div>
  );
};

export default FilterPanel;
