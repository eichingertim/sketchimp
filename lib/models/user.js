/* eslint-env node */

const mongoose = require("mongoose"),
    bcrypt = require("bcryptjs"),
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
    });

module.exports = mongoose.model("User", userSchema);