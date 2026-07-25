import api from "./api";

export const createTeam = async (data) => {
    const res = await api.post("/teams", data);
    return res.data;
};

export const joinTeam = async (data) => {
    const res = await api.post("/teams/join", data);
    return res.data;
};

export const getTeamById = async (id) => {
    const res = await api.get(`/teams/${id}`);
    return res.data;
};

export const leaveTeam = async (teamId) => {
    const res = await api.patch(`/teams/${teamId}/leave`);
    return res.data;
};

export const removeMember = async (teamId, memberId) => {
    const res = await api.patch(`/teams/${teamId}/remove-member`, { memberId });
    return res.data;
};

export const transferLeadership = async (teamId, newLeaderId) => {
    const res = await api.patch(`/teams/${teamId}/transfer-leadership`, { newLeaderId });
    return res.data;
};

export const deleteTeam = async (teamId) => {
    const res = await api.delete(`/teams/${teamId}`);
    return res.data;
};