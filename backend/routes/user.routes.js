const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const protect = require("../middleware/auth.middleware");

router.get("/me", protect, userController.getMe);
router.put("/me", protect, userController.updateProfile);
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);

module.exports = router;