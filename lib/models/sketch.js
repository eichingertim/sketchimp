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
        upvotes: {
            type: Number,
            default: 0,
        },
        downvotes: {
            type: Number,
            default: 0,
        },
        data:{
            type: String,
            default: "",
        },
        finalized:{
            type: Boolean,
            default: false,
        },
    });

module.exports = mongoose.model("Sketch", sketchSchema);
