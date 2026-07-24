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