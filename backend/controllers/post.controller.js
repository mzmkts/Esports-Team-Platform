const Post = require("../models/Post");

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

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userId = req.user._id;

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (id) => id.toString() !== userId.toString()
            );
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // only author or admin
        if (
            post.author.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Not allowed" });
        }

        await post.deleteOne();

        res.json({ message: "Post deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {createPost, deletePost, likePost, getPostById, getPosts}