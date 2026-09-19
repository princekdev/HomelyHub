import api from "./api";

export const createBooking = async (payload) => {
  const { data } = await api.post("/bookings", payload);
  return data;
};

export const getMyBookings = async () => {
  const { data } = await api.get("/bookings/my");
  return data;
};

export const getHostBookings = async () => {
  const { data } = await api.get("/bookings/host");
  return data;
};

export const getBookingById = async (id) => {
  const { data } = await api.get(`/bookings/${id}`);
  return data;
};

export const updateBookingStatus = async (id, status) => {
  const { data } = await api.patch(`/bookings/${id}/status`, { status });
  return data;
};
