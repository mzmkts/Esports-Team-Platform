const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const protect = require("../middleware/auth.middleware");

router.post("/", protect, postController.createPost);
router.get("/", postController.getPosts);
router.get("/:id", postController.getPostById);
router.put("/:id/like", protect, postController.likePost);
router.delete("/:id", protect, postController.deletePost);

module.exports = router;