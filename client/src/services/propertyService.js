import api from "./api";

export const getProperties = async (params = {}) => {
  const { data } = await api.get("/properties", { params });
  return data;
};

export const getPropertyById = async (id) => {
  const { data } = await api.get(`/properties/${id}`);
  return data;
};

export const getMyProperties = async () => {
  const { data } = await api.get("/properties/host/mine");
  return data;
};

export const createProperty = async (formData) => {
  const { data } = await api.post("/properties", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateProperty = async (id, formData) => {
  const { data } = await api.put(`/properties/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteProperty = async (id) => {
  const { data } = await api.delete(`/properties/${id}`);
  return data;
};

export const checkAvailability = async (id, checkIn, checkOut) => {
  const { data } = await api.get(`/properties/${id}/availability`, {
    params: { checkIn, checkOut },
  });
  return data;
};

export const getPropertyReviews = async (id) => {
  const { data } = await api.get(`/properties/${id}/reviews`);
  return data;
};

export const submitReview = async (propertyId, payload) => {
  const { data } = await api.post(`/properties/${propertyId}/reviews`, payload);
  return data;
};
