import api from "./api";

export const getLeaderboard = async (hackathonId) => {
    const res = await api.get(`/leaderboard/${hackathonId}`);
    return res.data;
};
