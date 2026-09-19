import api from "./api";

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const fetchCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const updateProfile = async (formData) => {
  const { data } = await api.put("/auth/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Note: there is no self-service "become a host" call. Every account starts
// as role "user" and only an admin can change a user's role (see
// adminService.updateUserRole), either from the Admin > Users panel or
// directly in the database.
