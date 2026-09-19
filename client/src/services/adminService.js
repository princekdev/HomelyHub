import api from "./api";

export const getAdminStats = async () => {
  const { data } = await api.get("/admin/stats");
  return data;
};

export const getAdminUsers = async (role) => {
  const { data } = await api.get("/admin/users", { params: role ? { role } : {} });
  return data;
};

export const setUserBlockedStatus = async (id, isBlocked) => {
  const { data } = await api.patch(`/admin/users/${id}/status`, { isBlocked });
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data;
};

export const getAdminProperties = async () => {
  const { data } = await api.get("/admin/properties");
  return data;
};

export const adminRemoveProperty = async (id) => {
  const { data } = await api.delete(`/admin/properties/${id}`);
  return data;
};

export const getAdminBookings = async () => {
  const { data } = await api.get("/admin/bookings");
  return data;
};
