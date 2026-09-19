import api from "./api";

// Create a Razorpay order (or a demo order when keys not configured)
export const createPaymentOrder = async (payload) => {
  const { data } = await api.post("/payments/create-order", payload);
  return data;
};

// Verify payment signature and persist confirmed booking
export const verifyPayment = async (payload) => {
  const { data } = await api.post("/payments/verify", payload);
  return data;
};
