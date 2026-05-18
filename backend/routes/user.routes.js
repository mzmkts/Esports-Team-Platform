const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

const {
    getMe,
    getUserById,
    getUsers,
    updateProfile,
    uploadAvatar
} = require("../controllers/user.controller");

// Ловим файл из Multipart-формы, поле "avatar"
router.post(
    "/upload-avatar",
    protect,
    upload.single("avatar"),
    uploadAvatar
);

router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.get("/", getUsers);
router.get("/:id", getUserById);

module.exports = router;