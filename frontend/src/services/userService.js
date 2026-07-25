import api from "./api";

export const getUsersByRole = async (role) => {
    const res = await api.get(`/users/role?role=${role}`);
    return res.data;
};

export const getAllUsers = async () => {
    const res = await api.get("/users");
    return res.data;
};

export const getUserById = async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
};

export const updateUser = async (id, data) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
};

export const deleteUser = async (id) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
};

export const toggleBlockUser = async (id) => {
    const res = await api.patch(`/users/${id}/toggle-block`);
    return res.data;
};

export const createJudge = async (judgeData) => {
    const res = await api.post("/auth/create-judge", judgeData);
    return res.data;
};

export const updateUserRole = async (id, role) => {
    const res = await api.patch(`/auth/users/${id}/role`, { role });
    return res.data;
};