const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    likePost,
    deletePost,
    uploadPostImage,
    getLikedPosts
} = require("../controllers/post.controller");

router.post("/upload-image", protect, upload.single("image"), uploadPostImage);
router.post("/", protect, createPost);
router.get("/", getPosts);
router.get("/liked", protect, getLikedPosts); // <-- ПОДНЯЛИ НАВЕРХ, ТЕПЕРЬ ОН РАБОТАЕТ!

router.put("/:id", protect, updatePost);
router.get("/:id", getPostById);
router.put("/:id/like", protect, likePost);
router.delete("/:id", protect, deletePost);

module.exports = router;