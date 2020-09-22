/* eslint-env node */

const mongoose = require("mongoose"),
    Constants = require("../config/Constants"),
    userSchema = mongoose.Schema({
        username: {
            type: String,
            unique: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password:{
            type: String,
            required: true,
            minlength:6,
        },
        creation: {
            type: Date,
            default: Date.now,
        },
        channels: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
        }],
        lastUsedChannel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
        },
        online: {
            type: Boolean,
            default: false,
        },
        score: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            default: "Hi, I'm using Sketching2",
        },
        info: {
            type: String,
            default: "Seems empty right now",
        },
        avatar: {
            type: String,
            default: Constants.PROFILE_IMAGE_PLACEHOLDER,
        },
    });

module.exports = mongoose.model("User", userSchema);