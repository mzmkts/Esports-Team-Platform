const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        image: String,

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
        },

        tags: [String],

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);