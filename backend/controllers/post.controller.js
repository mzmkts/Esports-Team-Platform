const Post = require("../models/Post.js");
const { UTApi } = require("uploadthing/server");
const { File } = require("node:buffer");

const createPost = async (req, res) => {
    try {
        const post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            image: req.body.image,
            tags: req.body.tags,
            author: req.user._id,
            team: req.body.team || null,
        });
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username avatar")
            .populate("team", "name logo")
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "username avatar")
            .populate("team")
            .populate("likes", "username");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;
        post.image = req.body.image || post.image;

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Пост не найден" });
        }

        const userId = req.user._id; // ID текущего юзера из твоего middleware protect
        const userIndex = post.likes.indexOf(userId);

        if (userIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(userIndex, 1);
        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate("author", "username") // Добавь те поля автора, которые используешь (например: username avatar)
            .populate("team"); // Если нужно для других компонентов

        return res.status(200).json(updatedPost);
    } catch (err) {
        console.error("Ошибка в likePost:", err);
        return res.status(500).json({ message: "Ошибка сервера" });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }

        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const uploadPostImage = async (req, res) => {
    try {
        if (!req.file) {
            res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
            return res.end(JSON.stringify({ message: "Файл не передан" }));
        }

        const utapi = new UTApi({ apiKey: process.env.UPLOADTHING_TOKEN });
        const fileToUpload = new File([req.file.buffer], `post_${Date.now()}.png`, { type: req.file.mimetype });
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
            return res.end(JSON.stringify({ message: "Не удалось извлечь data из ответа" }));
        }

        const uploadedUrl = fileData.ufsUrl || fileData.url;
        const responseData = JSON.stringify({ success: true, imageUrl: uploadedUrl });

        res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": Buffer.byteLength(responseData),
            "Connection": "close"
        });
        return res.end(responseData);
    } catch (err) {
        const errData = JSON.stringify({ message: "Внутренняя ошибка сервера: " + err.message });
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8", "Connection": "close" });
        return res.end(errData);
    }
};

const getLikedPosts = async (req, res) => {
    try {
        // Ищем посты, где в массиве likes содержится ID авторизованного юзера (req.user._id)
        const likedPosts = await Post.find({ likes: req.user._id })
            .populate("author", "username") // Обязательно делаем populate автора, чтобы он не пропадал
            .sort({ createdAt: -1 }); // Свежие лайки будут сверху

        return res.status(200).json(likedPosts);
    } catch (err) {
        console.error("Ошибка в getLikedPosts:", err);
        return res.status(500).json({ message: "Ошибка сервера" });
    }
};

module.exports = { createPost, getPosts, getPostById, updatePost, likePost, deletePost, uploadPostImage, getLikedPosts };