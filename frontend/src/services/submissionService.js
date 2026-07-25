import api from "./api";

export const createSubmission = async (data) => {
    const res = await api.post("/submissions", data);
    return res.data;
};

export const getMySubmission = async (hackathonId) => {
    const res = await api.get(`/submissions/my/${hackathonId}`);
    return res.data;
};

export const updateSubmission = async (id, data) => {
    const res = await api.put(`/submissions/${id}`, data);
    return res.data;
};

export const getSubmissionById = async (id) => {
    const res = await api.get(`/submissions/${id}`);
    return res.data;
};

export const getSubmissionsByHackathon = async (hackathonId) => {
    const res = await api.get(`/submissions/hackathon/${hackathonId}`);
    return res.data;
};