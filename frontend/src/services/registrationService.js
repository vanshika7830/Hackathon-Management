import api from "./api";

export const registerTeam = async (data) => {
    const res = await api.post("/registrations", data);
    return res.data;
};

export const getMyRegistrations = async () => {
    const res = await api.get("/registrations/my-registrations");
    return res.data;
};

export const cancelRegistration = async (id) => {
    const res = await api.delete(`/registrations/${id}`);
    return res.data;
};

export const getHackathonRegistrations = async (hackathonId) => {
    const res = await api.get(`/registrations/hackathon/${hackathonId}`);
    return res.data;
};

export const approveRegistration = async (id) => {
    const res = await api.patch(`/registrations/${id}/approve`);
    return res.data;
};

export const rejectRegistration = async (id) => {
    const res = await api.patch(`/registrations/${id}/reject`);
    return res.data;
};