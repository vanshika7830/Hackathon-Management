import api from "./api";

export const getAllHackathons = async (organizerId) => {
    const query = organizerId ? `?organizer=${organizerId}` : "";
    const res = await api.get(`/hackathons${query}`);
    return res.data;
};

export const getHackathonById = async (id) => {
    const res = await api.get(`/hackathons/${id}`);
    return res.data;
};

export const createHackathon = async (data) => {
    const res = await api.post("/hackathons", data);
    return res.data;
};

export const updateHackathon = async (id, data) => {
    const res = await api.put(`/hackathons/${id}`, data);
    return res.data;
};

export const deleteHackathon = async (id) => {
    const res = await api.delete(`/hackathons/${id}`);
    return res.data;
};

export const assignJudge = async (id, judgeId) => {
    const res = await api.patch(`/hackathons/${id}/assign-judge`, { judgeId });
    return res.data;
};