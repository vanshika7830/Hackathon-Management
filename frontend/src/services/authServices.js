import api from "./api";

export const signup = async (userData) => {
    const res = await api.post("/auth/signup", userData);
    return res.data;
};

export const login = async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
};

export const getMe = async () => {
    const res = await api.get("/auth/me");
    return res.data;
};

export const changePassword = async (passwordData) => {
    const res = await api.patch("/auth/change-password", passwordData);
    return res.data;
};

export const forgotPassword = async (email) => {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
};

export const resetPassword = async (token, newPassword) => {
    const res = await api.post(`/auth/reset-password/${token}`, { newPassword });
    return res.data;
};