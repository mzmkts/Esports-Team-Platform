const User = require("../models/User");
const { UTApi } = require("uploadthing/server");
const { File } = require("node:buffer");

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("teams")
            .select("-password");

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        return res.status(200).json(user);
    } catch (err) {
        console.error("Ошибка в getMe:", err);
        return res.status(500).json({ message: "Ошибка сервера" });
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
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
        user.avatar = req.body.avatar || user.avatar;
        user.favoriteGames = req.body.favoriteGames || user.favoriteGames;

        await user.save();

        const updatedUser = await User.findById(user._id)
            .populate("teams")
            .select("-password");

        res.json(updatedUser);
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

const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            return res.end(JSON.stringify({ message: "Файл не передан" }));
        }

        const utapi = new UTApi({ apiKey: process.env.UPLOADTHING_TOKEN });

        const fileToUpload = new File(
            [req.file.buffer],
            `avatar_${req.user._id}_${Date.now()}.png`,
            { type: req.file.mimetype }
        );

        const response = await utapi.uploadFiles([fileToUpload]);

        let fileData = null;
        if (Array.isArray(response)) {
            fileData = response[0]?.data;
            if (response[0]?.error) {
                res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
                return res.end(JSON.stringify({ message: "Ошибка UploadThing: " + response[0].error.message }));
            }
        } else if (response && response.data) {
            fileData = response.data;
        }

        if (!fileData) {
            res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
            return res.end(JSON.stringify({ message: "Не удалось извлечь data из ответа UploadThing" }));
        }

        const uploadedUrl = fileData.ufsUrl || fileData.url;

        const user = await User.findById(req.user._id);
        if (!user) {
            res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
            return res.end(JSON.stringify({ message: "Пользователь не найден" }));
        }

        user.avatar = uploadedUrl;
        await user.save();

        const responseData = JSON.stringify({
            success: true,
            avatar: uploadedUrl
        });

        res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": Buffer.byteLength(responseData),
            "Connection": "close"
        });

        return res.end(responseData);

    } catch (err) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА БЭКЕНДА:", err);
        const errData = JSON.stringify({ message: "Внутренняя ошибка сервера: " + err.message });
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8", "Connection": "close" });
        return res.end(errData);
    }
};

module.exports = {
    getMe,
    getUserById,
    getUsers,
    updateProfile,
    uploadAvatar
};