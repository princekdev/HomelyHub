import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, MapPinned, CalendarX, Users2 } from "lucide-react";
import SearchBar from "../components/SearchBar";
import PropertyGrid from "../components/PropertyGrid";
import { getProperties } from "../services/propertyService";
import { POPULAR_DESTINATIONS } from "../utils/constants";

const WHY_ITEMS = [
  { icon: ShieldCheck, title: "Verified Properties", desc: "Every listing is reviewed before it goes live." },
  { icon: Lock, title: "Secure Booking", desc: "Your data and bookings are protected end-to-end." },
  { icon: MapPinned, title: "Best Locations", desc: "Handpicked stays across India's top destinations." },
  { icon: CalendarX, title: "Easy Cancellation", desc: "Flexible cancellation policies on most stays." },
  { icon: Users2, title: "Trusted Hosts", desc: "Hosts who care about your comfort and safety." },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProperties({ limit: 8, sort: "rating" });
        setFeatured(res.data);
      } catch (err) {
        // Non-critical section - fail silently on the landing page
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-500 to-brand-700 text-white pt-16 pb-28 px-4">
        <div className="container-app text-center">
          <h1 className="text-3xl sm:text-5xl font-display font-bold mb-4">
            Find your perfect stay, anywhere.
          </h1>
          <p className="text-brand-50 text-sm sm:text-base mb-10 max-w-xl mx-auto">
            Discover verified homes, villas, and apartments across India — booked securely, hosted by people you can trust.
          </p>
        </div>
        <div className="container-app -mb-20 relative z-10">
          <SearchBar />
        </div>
      </section>

      <div className="h-16" />

      {/* Featured Properties */}
      <section className="container-app py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Properties</h2>
          <Link to="/explore" className="text-brand-600 text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        <PropertyGrid properties={featured} loading={loading} />
      </section>

      {/* Popular Destinations */}
      <section className="bg-white py-14">
        <div className="container-app">
          <h2 className="text-2xl font-bold mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_DESTINATIONS.map((d, i) => (
              <Link
                key={d.city}
                to={`/explore?location=${encodeURIComponent(d.city)}`}
                className="relative rounded-xl2 overflow-hidden h-28 group"
              >
                <img
                  src={`https://picsum.photos/seed/${d.city}/400/300`}
                  alt={d.city}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(d.city)}&background=f6402a&color=fff&size=400`;
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-ink-900/40 flex items-end p-3">
                  <span className="text-white font-semibold text-sm">{d.city}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why HomelyHub */}
      <section className="container-app py-14">
        <h2 className="text-2xl font-bold mb-8 text-center">Why HomelyHub?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {WHY_ITEMS.map((item) => (
            <div key={item.title} className="text-center px-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-50 text-brand-500 mb-3">
                <item.icon size={24} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-ink-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Become a host CTA */}
      <section className="bg-ink-900 text-white py-16">
        <div className="container-app text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Turn your property into an opportunity.
          </h2>
          <p className="text-ink-300 mb-6 max-w-lg mx-auto text-sm">
            List your space on HomelyHub and start earning from guests looking for their next stay.
          </p>
          <Link to="/become-host" className="btn-primary inline-flex">
            Become a Host
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
