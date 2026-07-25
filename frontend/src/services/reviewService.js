import api from "./api";

export const getJudgeAssignments = async () => {
    const res = await api.get("/reviews/my-assignments");
    return res.data;
};

export const submitReview = async (data) => {
    const res = await api.post("/reviews", data);
    return res.data;
};

export const getReviewsBySubmission = async (submissionId) => {
    const res = await api.get(`/reviews/submission/${submissionId}`);
    return res.data;
};