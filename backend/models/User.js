const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        avatar: String,

        bio: String,

        favoriteGames: [String],

        teams: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Team",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);