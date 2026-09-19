import { useFavorites } from "../context/FavoritesContext";
import PropertyGrid from "../components/PropertyGrid";

const Favorites = () => {
  const { favorites, loading } = useFavorites();

  return (
    <div className="container-app py-8">
      <h1 className="text-2xl font-bold mb-1">Your Favorites</h1>
      <p className="text-sm text-ink-500 mb-6">Properties you've saved for later.</p>
      <PropertyGrid
        properties={favorites}
        loading={loading}
        emptyTitle="No favorites yet."
        emptyMessage="Tap the heart icon on any property to save it here."
      />
    </div>
  );
};

export default Favorites;
