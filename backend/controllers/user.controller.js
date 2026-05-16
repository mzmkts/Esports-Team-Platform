const User = require("../models/User");

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("teams", "name logo game");

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("teams", "name logo game");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.username = req.body.username || user.username;
        user.bio = req.body.bio || user.bio;
        user.avatar = req.body.avatar || user.avatar;
        user.favoriteGames = req.body.favoriteGames || user.favoriteGames;

        await user.save();

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .populate("teams", "name logo");

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {getMe, getUserById, getUsers, updateProfile}