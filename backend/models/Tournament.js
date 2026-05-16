const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
    {
        title: String,
        game: String,
        startDate: Date,
        prizePool: String,
        banner: String,
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tournament", tournamentSchema);