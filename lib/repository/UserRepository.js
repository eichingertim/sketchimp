/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const {ObjectID} = require("mongodb"),
  User = require("../models/user"),
  Observable = require("../config/utils/Observable.js");

class UserProfile {
    constructor(id, name, score, status, info) {
        this.id = id;
        this.name = name;
        this.score = score;
        this.status = status;
        this.info = info;
        this.sharedChannels = [];
    }
}

class UserRepository extends Observable {
    constructor() {
        super();
    }

    createUser(name, email, password) {
        const newUser = {
            username: name,
            email: email,
            password: password,
            channels: [],
        };
        return User.create(newUser).then((rUser) => {
            if (rUser) {
                return rUser;
            }
            throw "something went wrong";
        });
    }

    getForId(userId){
        if(!ObjectID.isValid(userId)){
            return;
        }
        return User.findById(userId).then((rUser) =>{
            return rUser;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getForEmail(email) {
        return User.findOne({ email }).then((rUser) => {
            if(rUser){
                return rUser;
            }
            throw "something went wrong";
        });
    }

    updateForId(userId, userBody) {
        if(!ObjectID.isValid(userId)){
            return;
        }
        return User.findByIdAndUpdate(userId, userBody).then((rUser) => {
            return rUser;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getPopulatedForId(userId) {
        if(!ObjectID.isValid(userId)){
            return;
        }
        return User.findById(userId).populate("channels").then((rUser) =>{
            return rUser;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getUserProfile(userId, currentUser) {
        if(!ObjectID.isValid(userId)){
            return;
        }
        return User.findById(userId).populate("channels").then((rUser) =>{
            let userProfile = new UserProfile(
                rUser.id,
                rUser.username,
                rUser.score,
                rUser.status,
                rUser.info
            );
            currentUser.channels.forEach(channel => {
                rUser.channels.forEach(targetChannel => {
                    if (targetChannel._id.equals(channel._id)) {
                        userProfile.sharedChannels.push(targetChannel.name);
                    }
                });
            });
            return userProfile;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    addChannelToList(user, channelId) {
        if(!ObjectID.isValid(user._id) || !ObjectID.isValid(channelId)){
            return;
        }
        user.channels.push(channelId);
        this.updateLastUsedChannel(user, channelId);
    }

    updateLastUsedChannel(user, channelId) {
        if(!ObjectID.isValid(user._id) || !ObjectID.isValid(channelId)){
            return;
        }
        user.lastUsedChannel = channelId;
        user.save();
    }

    removeChannelFromList(user, channelId) {
        if(!ObjectID.isValid(user._id) || !ObjectID.isValid(channelId)){
            return;
        }
        user.channels.pull(channelId);
        this.updateLastUsedChannel(user, user.channels[0]);
    }
}

module.exports = new UserRepository();