const Team = require("../models/Team");
const Message = require("../models/Message");

const createTeam = async (req, res) => {
    const team = await Team.create({
        name: req.body.name,
        description: req.body.description,
        game: req.body.game,
        logo: req.body.logo,
        owner: req.user._id,
        members: [req.user._id],
    });

    res.json(team);
};

const getTeams = async (req, res) => {
    const teams = await Team.find()
        .populate("owner", "username avatar")
        .populate("members", "username avatar");

    res.json(teams);
};

const getTeamById = async (req, res) => {
    const team = await Team.findById(req.params.id)
        .populate("owner")
        .populate("members");

    res.json(team);
};

const joinTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.members.includes(req.user._id)) {
            return res.status(400).json({ message: "Already in team" });
        }

        if (team.members.length >= team.maxMembers) {
            return res.status(400).json({ message: "Team is full" });
        }

        team.members.push(req.user._id);
        await team.save();

        await Message.create({
            sender: req.user._id,
            team: team._id,
            content: `${req.user.username} вступил в команду`,
            messageType: "system"
        });

        res.json({ message: "Вступил в команду", team });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const leaveTeam = async (req, res) => {
    const team = await Team.findById(req.params.id);

    team.members = team.members.filter(
        (id) => id.toString() !== req.user._id.toString()
    );

    await team.save();

    res.json({ message: "Left team" });
};

const deleteTeam = async (req, res) => {
    const team = await Team.findById(req.params.id);

    if (team.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not owner" });
    }

    await team.deleteOne();

    res.json({ message: "Team deleted" });
};
const updateTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this team" });
        }

        team.name = req.body.name || team.name;
        team.description = req.body.description || team.description;
        team.game = req.body.game || team.game;
        team.logo = req.body.logo || team.logo;

        await team.save();
        res.json({ message: "Team updated successfully", team });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
module.exports = {createTeam, getTeams, getTeamById, joinTeam, leaveTeam, deleteTeam, updateTeam}