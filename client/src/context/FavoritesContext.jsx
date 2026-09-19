import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getFavorites, addFavorite, removeFavorite } from "../services/favoriteService";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getFavorites();
      setFavorites(res.data);
    } catch (err) {
      // silent fail - favorites are non-critical
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = (propertyId) => favorites.some((f) => f._id === propertyId);

  const toggleFavorite = async (property) => {
    if (!isAuthenticated) {
      toast.error("Please log in to save favorites");
      return;
    }
    const already = isFavorite(property._id);
    // Optimistic update
    setFavorites((prev) =>
      already ? prev.filter((f) => f._id !== property._id) : [...prev, property]
    );
    try {
      if (already) {
        await removeFavorite(property._id);
        toast.success("Removed from favorites");
      } else {
        await addFavorite(property._id);
        toast.success("Added to favorites");
      }
    } catch (err) {
      // revert on failure
      setFavorites((prev) =>
        already ? [...prev, property] : prev.filter((f) => f._id !== property._id)
      );
      toast.error("Could not update favorites");
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loading, isFavorite, toggleFavorite, refreshFavorites: loadFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};
