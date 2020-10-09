/* eslint-env node */

const mongoose = require("mongoose"),

    /**
     * Defines a Schema for storing channels in the MongoDB
     * each channel stores its creator and a list of users divided into different permission types 
     */
    channelSchema = new mongoose.Schema({
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        participants: {
            admins: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }],
            collaborators: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }],
            viewers: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }],
        },
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