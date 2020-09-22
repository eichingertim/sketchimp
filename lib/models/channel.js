/* eslint-env node */

const mongoose = require("mongoose"),
    channelSchema = new mongoose.Schema({
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        name: {
            type: String,
            required: true,
        },
        creation: {
            type: Date,
            default: Date.now,
        },
        icon: {
            type: String,
            default: undefined,
        },
    });

module.exports = mongoose.model("Channel", channelSchema);
