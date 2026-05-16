const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashed,
    });

    res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Wrong password" });

    res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
    });
};

module.exports = {register, login}