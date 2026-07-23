
export const uploadSingleFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        return res.status(200).json({
            message: "File uploaded successfully",
            url: req.file.path,
            public_id: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const uploadMultipleFiles = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadedFiles = req.files.map((file) => ({
            url: file.path,
            public_id: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        }));

        return res.status(200).json({
            message: "Files uploaded successfully",
            files: uploadedFiles,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
