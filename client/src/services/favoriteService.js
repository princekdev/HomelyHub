import api from "./api";

export const getFavorites = async () => {
  const { data } = await api.get("/users/favorites");
  return data;
};

export const addFavorite = async (propertyId) => {
  const { data } = await api.post(`/users/favorites/${propertyId}`);
  return data;
};

export const removeFavorite = async (propertyId) => {
  const { data } = await api.delete(`/users/favorites/${propertyId}`);
  return data;
};
