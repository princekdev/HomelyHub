import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import PropertyGrid from "../components/PropertyGrid";
import FilterPanel from "../components/FilterPanel";
import ErrorState from "../components/ErrorState";
import { getProperties } from "../services/propertyService";

const PAGE_SIZE = 12;

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sort, setSort] = useState("newest");

  const [filters, setFilters] = useState({
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    propertyType: searchParams.get("propertyType")?.split(",").filter(Boolean) || [],
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) || [],
    guests: searchParams.get("guests") || "",
    bedrooms: searchParams.get("bedrooms") || "",
  });

  const location = searchParams.get("location") || "";

  const fetchProperties = useCallback(
    async (pageNum = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: pageNum,
          limit: PAGE_SIZE,
          sort,
        };
        if (location) params.location = location;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.propertyType.length) params.propertyType = filters.propertyType.join(",");
        if (filters.amenities.length) params.amenities = filters.amenities.join(",");
        if (filters.guests) params.guests = filters.guests;
        if (filters.bedrooms) params.bedrooms = filters.bedrooms;

        const res = await getProperties(params);
        setProperties(res.data);
        setTotalPages(res.meta.totalPages || 1);
        setPage(res.meta.page || 1);
      } catch (err) {
        setError("Could not load properties right now.");
      } finally {
        setLoading(false);
      }
    },
    [location, sort, filters]
  );

  useEffect(() => {
    fetchProperties(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, sort]);

  const applyFilters = () => {
    setMobileFiltersOpen(false);
    fetchProperties(1);
  };

  const clearFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", propertyType: [], amenities: [], guests: "", bedrooms: "" });
    setSearchParams({});
  };

  return (
    <div className="container-app py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {location ? `Stays in ${location}` : "Explore properties"}
          </h1>
          <p className="text-sm text-ink-500">Find your next stay from verified HomelyHub listings.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field text-sm w-auto"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <button
            className="btn-outline lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:block lg:col-span-1">
          <FilterPanel filters={filters} setFilters={setFilters} onApply={applyFilters} onClear={clearFilters} />
        </div>

        <div className="lg:col-span-3">
          {error ? (
            <ErrorState message={error} onRetry={() => fetchProperties(page)} />
          ) : (
            <>
              <PropertyGrid properties={properties} loading={loading} />
              {totalPages > 1 && !loading && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => fetchProperties(i + 1)}
                      className={`w-9 h-9 rounded-full text-sm font-medium ${
                        page === i + 1
                          ? "bg-brand-500 text-white"
                          : "bg-white border border-ink-200 text-ink-700 hover:border-brand-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-ink-50 overflow-y-auto p-4">
            <button onClick={() => setMobileFiltersOpen(false)} className="mb-3 p-2"><X size={20} /></button>
            <FilterPanel filters={filters} setFilters={setFilters} onApply={applyFilters} onClear={clearFilters} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
