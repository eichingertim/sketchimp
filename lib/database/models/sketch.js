/* eslint-env node */

const mongoose = require("mongoose"),

    /**
     * Defines a Schema for storing sketches in the MongoDB
     * each channel stores its channel and a list of users that upvoted or downvoted
     * a sketch can be finalized when it was finished by its channel and will appear in the public feed once it has been published by an admin
     */

    sketchSchema = new mongoose.Schema({
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
        },
        name: {
            type: String,
            required: true,
        },
        creation: {
            type: Date,
            default: Date.now,
        },
        upvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        downvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        data:{
            type: String,
            default: "",
        },
        multilayer:{
            type: Boolean,
            default: "false",
        },
        path:{
            type: String,
            default: "",
        },
        finalized:{
            type: Boolean,
            default: false,
        },
        published:{
            type: Boolean,
            default: false,
        },
    });

module.exports = mongoose.model("Sketch", sketchSchema);
