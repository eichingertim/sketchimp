/* eslint-env node */

const mongoose = require("mongoose"),
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
        path:{
            type: String,
            defualt: "",
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
