import Registration from "../models/Registration.js";
import Team from "../models/Team.js";
import Hackathon from "../models/Hackathon.js";

export const registerTeam = async (req, res) => {
    try {
        const { teamId } = req.body;
        const targetTeamId = teamId || req.body.team;

        if (!targetTeamId) {
            return res.status(400).json({ message: "Team ID is required" });
        }

        const team = await Team.findById(targetTeamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only team leader can register the team" });
        }

        const hackathon = await Hackathon.findById(team.hackathon);
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        if (!hackathon.isRegistrationOpen) {
            return res.status(400).json({ message: "Registration is closed for this hackathon" });
        }
        if (new Date() > new Date(hackathon.registrationDeadline)) {
            return res.status(400).json({ message: "Registration deadline has passed" });
        }

        const existingRegistration = await Registration.findOne({
            team: team._id,
            hackathon: hackathon._id,
        });

        if (existingRegistration) {
            return res.status(400).json({
                message: `Team registration already exists with status: ${existingRegistration.status}`,
            });
        }

        const registration = await Registration.create({
            team: team._id,
            hackathon: hackathon._id,
            status: "pending",
            registeredBy: req.user._id,
        });

        res.status(201).json({ message: "Team registered successfully", registration });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate("team");
        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }

        if (registration.team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only team leader can cancel registration" });
        }

        if (registration.status !== "pending") {
            return res.status(400).json({
                message: `Cannot cancel registration that is already ${registration.status}`,
            });
        }

        await registration.deleteOne();
        res.status(200).json({ message: "Registration cancelled successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyRegistrations = async (req, res) => {
    try {
        const userTeams = await Team.find({ members: req.user._id });
        const teamIds = userTeams.map((t) => t._id);

        const registrations = await Registration.find({ team: { $in: teamIds } })
            .populate("team")
            .populate("hackathon", "title mode status startDate endDate registrationDeadline")
            .populate("registeredBy", "firstName lastName email");

        res.status(200).json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHackathonRegistrations = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        if (
            req.user.role === "organizer" &&
            hackathon.organizer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied. You are not the organizer of this hackathon",
            });
        }

        const registrations = await Registration.find({ hackathon: hackathonId })
            .populate({
                path: "team",
                populate: {
                    path: "members leader",
                    select: "firstName lastName email",
                },
            })
            .populate("registeredBy", "firstName lastName email");

        res.status(200).json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const approveRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate("hackathon");
        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }

        if (
            req.user.role === "organizer" &&
            registration.hackathon.organizer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: "Access denied" });
        }

        registration.status = "approved";
        await registration.save();

        res.status(200).json({ message: "Registration approved successfully", registration });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate("hackathon");
        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }

        if (
            req.user.role === "organizer" &&
            registration.hackathon.organizer.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: "Access denied" });
        }

        registration.status = "rejected";
        await registration.save();

        res.status(200).json({ message: "Registration rejected successfully", registration });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
