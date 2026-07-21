import Hackathon from "../models/Hackathon.js";

export const createHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.create({
            ...req.body,
            organizer: req.user._id,
        });
        return res.status(201).json(hackathon);
    }
    catch (error) {
        console.log("Error Occurred");
        res.status(500).json({ message: error.message });
    }
}


export const getAllHackathon = async (req, res) => {
    try {
        const hackathons = await Hackathon.find().populate("organizer", "firstName lastName email");
        return res.status(200).json(hackathons);
    } catch (error) {
        console.log("Error Occurred");
        res.status(500).json({ message: error.message });
    }
};

export const getHackathonById = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id).populate(
            "organizer",
            "firstName lastName email"
        );
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }
        res.status(200).json(hackathon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        if (hackathon.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this hackathon" });
        }

        const updated = await Hackathon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteHackathon = async (req, res) => {
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        const isOwner = hackathon.organizer.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to delete this hackathon" });
        }

        await hackathon.deleteOne();
        res.status(200).json({ message: "Hackathon deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};