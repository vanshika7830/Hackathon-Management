import api from "./api";

export const uploadSingleFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/upload/single", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};

export const uploadMultipleFiles = async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }
    const res = await api.post("/upload/multiple", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};
