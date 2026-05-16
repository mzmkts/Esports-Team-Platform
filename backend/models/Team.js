const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },

        logo: String,

        description: String,

        game: String,

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        maxMembers: {
            type: Number,
            default: 5,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);