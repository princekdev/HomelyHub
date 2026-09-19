import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Star, Users, BedDouble, Bath, Home as HomeIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { getPropertyById, getPropertyReviews } from "../services/propertyService";
import BookingCard from "../components/BookingCard";
import RatingStars from "../components/RatingStars";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import { formatDate } from "../utils/format";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [propRes, reviewRes] = await Promise.all([
          getPropertyById(id),
          getPropertyReviews(id),
        ]);
        setProperty(propRes.data);
        setReviews(reviewRes.data);
      } catch (err) {
        setError("This property could not be found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (error || !property) return <ErrorState message={error} />;

  const images = property.images?.length
    ? property.images
    : [{ url: `https://picsum.photos/seed/${property._id}/1200/800` }];

  return (
    <div className="container-app py-8">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold">{property.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-ink-600">
          <span className="flex items-center gap-1">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {property.rating > 0 ? property.rating.toFixed(1) : "New"}
            {property.reviewCount > 0 && <span>· {property.reviewCount} reviews</span>}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} /> {property.location.city}, {property.location.state}
          </span>
        </div>
      </div>

      {/* Image gallery */}
      <div className="grid grid-cols-4 gap-2 rounded-xl2 overflow-hidden h-72 sm:h-96 mb-8">
        <button
          onClick={() => { setActiveImage(0); setGalleryOpen(true); }}
          className="col-span-4 sm:col-span-2 row-span-2 relative"
        >
          <img src={images[0].url} alt={property.title} className="w-full h-full object-cover hover:brightness-95" />
        </button>
        {images.slice(1, 5).map((img, i) => (
          <button
            key={i}
            onClick={() => { setActiveImage(i + 1); setGalleryOpen(true); }}
            className="hidden sm:block relative"
          >
            <img src={img.url} alt="" className="w-full h-full object-cover hover:brightness-95" />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-6 pb-6 border-b border-ink-100 text-sm text-ink-700">
            <span className="flex items-center gap-2"><HomeIcon size={18} /> {property.propertyType}</span>
            <span className="flex items-center gap-2"><Users size={18} /> {property.guests} guests</span>
            <span className="flex items-center gap-2"><BedDouble size={18} /> {property.bedrooms} bedrooms</span>
            <span className="flex items-center gap-2"><Bath size={18} /> {property.bathrooms} baths</span>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">About this place</h2>
            <p className="text-ink-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-3">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((a) => (
                <span key={a} className="badge text-ink-700 bg-ink-100">{a}</span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-2">Hosted by {property.host?.name}</h2>
            <p className="text-sm text-ink-500">
              Member since {formatDate(property.host?.createdAt)}
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-4">
              Reviews {property.reviewCount > 0 && `(${property.reviewCount})`}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-ink-500">No reviews yet. Be the first to stay and leave one!</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((r) => (
                  <div key={r._id} className="flex gap-3">
                    <img
                      src={r.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user?.name || "U")}`}
                      alt={r.user?.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <p className="font-medium text-sm">{r.user?.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <RatingStars rating={r.rating} size={12} />
                        <span className="text-xs text-ink-400">{formatDate(r.createdAt)}</span>
                      </div>
                      <p className="text-sm text-ink-600 mt-1">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <BookingCard property={property} />
        </div>
      </div>

      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button onClick={() => setGalleryOpen(false)} className="absolute top-5 right-5 text-white p-2">
            <X size={26} />
          </button>
          <button
            onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-4 text-white p-2"
          >
            <ChevronLeft size={30} />
          </button>
          <img src={images[activeImage].url} alt="" className="max-h-[85vh] max-w-[90vw] object-contain" />
          <button
            onClick={() => setActiveImage((i) => (i + 1) % images.length)}
            className="absolute right-4 text-white p-2"
          >
            <ChevronRight size={30} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
