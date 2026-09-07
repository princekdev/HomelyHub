import { Link } from "react-router-dom";
import { Heart, Star, MapPin } from "lucide-react";
import { formatPrice } from "../utils/format";
import { useFavorites } from "../context/FavoritesContext";

const PropertyCard = ({ property }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(property._id);
  const image = property.images?.[0]?.url || `https://picsum.photos/seed/${property._id || "homelyhub"}/800/600`;

  return (
    <div className="card-surface overflow-hidden group">
      <Link to={`/properties/${property._id}`} className="block">
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={image}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(property);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-transform active:scale-90"
            aria-label="Toggle favorite"
          >
            <Heart size={17} className={fav ? "fill-brand-500 text-brand-500" : "text-ink-600"} />
          </button>
          <span className="absolute bottom-3 left-3 badge bg-white/90 text-ink-800">
            {property.propertyType}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/properties/${property._id}`}>
          <h3 className="font-semibold text-ink-900 truncate">{property.title}</h3>
        </Link>
        <p className="flex items-center gap-1 text-sm text-ink-500 mt-1">
          <MapPin size={13} />
          {property.location?.city}, {property.location?.state}
        </p>
        <div className="flex items-center justify-between mt-3">
          <p className="font-semibold text-ink-900">
            {formatPrice(property.pricePerNight)}
            <span className="text-ink-500 font-normal text-sm"> / night</span>
          </p>
          <div className="flex items-center gap-1 text-sm text-ink-700">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            {property.rating > 0 ? property.rating.toFixed(1) : "New"}
            {property.reviewCount > 0 && (
              <span className="text-ink-400">· {property.reviewCount}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
