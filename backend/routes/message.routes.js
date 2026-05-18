const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");

router.get("/team/:teamId", messageController.getTeamMessages);

module.exports = router;