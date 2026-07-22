import Team from "../models/Team.js";
import Hackathon from "../models/Hackathon.js";


const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createTeam = async (req, res) => {
    try {
        const { teamName, hackathonId } = req.body;

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: "Hackathon not found" });
        }

        const existingTeam = await Team.findOne({
            hackathon: hackathonId,
            members: req.user._id,
        });
        if (existingTeam) {
            return res.status(400).json({ message: "You already belong to a team in this hackathon" });
        }

        const inviteCode = generateInviteCode();

        const team = await Team.create({
            teamName,
            hackathon: hackathonId,
            leader: req.user._id,
            members: [req.user._id],
            inviteCode,
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const joinTeam = async (req, res) => {
    try {
        const { inviteCode } = req.body;

        const team = await Team.findOne({ inviteCode }).populate("hackathon");
        if (!team) {
            return res.status(404).json({ message: "Invalid invite code" });
        }

        const existingTeam = await Team.findOne({
            hackathon: team.hackathon._id,
            members: req.user._id,
        });
        if (existingTeam) {
            return res.status(400).json({ message: "You already belong to a team in this hackathon" });
        }

        // check team size limit
        if (team.members.length >= team.hackathon.maxTeamSize) {
            return res.status(400).json({ message: "Team is full" });
        }

        team.members.push(req.user._id);
        await team.save();

        res.status(200).json({ message: "Joined team successfully", team });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const leaveTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "Leader cannot leave. Transfer leadership or delete team instead.",
            });
        }

        team.members = team.members.filter(
            (memberId) => memberId.toString() !== req.user._id.toString()
        );
        await team.save();

        res.status(200).json({ message: "Left team", team });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { memberId } = req.body;

        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only leader can remove members" });
        }

        if (memberId === team.leader.toString()) {
            return res.status(400).json({ message: "Leader cannot remove self" });
        }

        team.members = team.members.filter(
            (id) => id.toString() !== memberId
        );
        await team.save();

        res.status(200).json({ message: "Member removed", team });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const transferLeadership = async (req, res) => {
    try {
        const { newLeaderId } = req.body;

        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only leader can transfer leadership" });
        }

        if (!team.members.map((id) => id.toString()).includes(newLeaderId)) {
            return res.status(400).json({ message: "New leader must be an existing team member" });
        }

        team.leader = newLeaderId;
        await team.save();

        res.status(200).json({ message: "Leadership transferred", team });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only leader can delete team" });
        }

        await team.deleteOne();
        res.status(200).json({ message: "Team deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getTeamById = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate("leader", "firstName lastName email")
            .populate("members", "firstName lastName email")
            .populate("hackathon", "title");
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }
        res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};