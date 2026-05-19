const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        messageType: {
            type: String,
            enum: ["text", "system"],
            default: "text",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);