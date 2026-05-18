const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const teamController = require("../controllers/team.controller");

router.post("/", protect, teamController.createTeam);
router.get("/", teamController.getTeams);
router.get("/:id", teamController.getTeamById);
router.post("/:id/join", protect, teamController.joinTeam);
router.post("/:id/leave", protect, teamController.leaveTeam);
router.delete("/:id", protect, teamController.deleteTeam);


module.exports = router;