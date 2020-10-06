/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const {ObjectID} = require("mongodb"),
  User = require("../models/user"),
  Constants = require("../../config/Constants"),
  Observable = require("../../config/utils/Observable.js");

class UserProfile {
    constructor(user) {
        this.id = user._id;
        this.name = user.username;
        this.score = user.score;
        this.status = user.status;
        this.info = user.info;
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
            throw Constants.RESPONSEMESSAGES.EMAIL_NOT_UNIQUE;
        });
    }

    getForId(userId){
        if(!ObjectID.isValid(userId)){
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        return User.findById(userId).then((rUser) =>{
            if (!rUser) {
                throw Constants.RESPONSEMESSAGES.USER_NOT_FOUND;
            }
            return rUser;
        }).catch((e) => {
            console.log(e);
            throw Constants.RESPONSEMESSAGES.USER_NOT_FOUND;
        });
    }

    checkUniqueEmail(email) {
        return User.findOne({ email }).then((rUser) => {
            if(rUser){
                throw Constants.RESPONSEMESSAGES.EMAIL_NOT_UNIQUE;
            }
            return true;
        });
    }

    getForEmail(email) {
        return User.findOne({ email }).then((rUser) => {
            if(rUser){
                return rUser;
            }
            throw Constants.RESPONSEMESSAGES.LOGIN_FAILED;
        });
    }

    updateForId(userId, userBody) {
        if(!ObjectID.isValid(userId)){
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        return User.findByIdAndUpdate(userId, userBody).then((rUser) => {
            if (!rUser) {
                throw Constants.RESPONSEMESSAGES.USER_NOT_FOUND;
            }
            return rUser;
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }

    getPopulatedForId(userId) {
        if(!ObjectID.isValid(userId)){
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        return User.findById(userId).populate("channels").then((rUser) =>{
            if (rUser) {
                return rUser;
            }
            throw Constants.RESPONSEMESSAGES.USER_NOT_FOUND;
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }

    getProfile(userId, currentUser) {
        if(!ObjectID.isValid(userId)){
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        return User.findById(userId).populate("channels").then((rUser) =>{
            if (!rUser) {
                throw Constants.RESPONSEMESSAGES.USER_NOT_FOUND;
            }
            let userProfile = new UserProfile(rUser);
            if (!currentUser._id.equals(rUser._id)) {
                currentUser.channels.forEach(channel => {
                    rUser.channels.forEach(targetChannel => {
                        if (targetChannel._id.equals(channel._id)) {
                            userProfile.sharedChannels.push(targetChannel.name);
                        }
                    });
                });
            }
            return userProfile;
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }

    setAvatar(user, imagePath) {
        if(!ObjectID.isValid(user._id)){
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        user.avatar = imagePath;
        user.save();
    }

    addChannelToList(user, channelId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        user.channels.push(channelId);
        this.updateLastUsedChannel(user, channelId);
    }

    updateLastUsedChannel(user, channelId) {
        user.lastUsedChannel = channelId;
        user.save();
    }

    removeChannelFromList(user, channelId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        user.channels.pull(channelId);
        this.updateLastUsedChannel(user, user.channels[0]);
    }

    removeChannelFromAll(userIds, channelId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        userIds.forEach((id) => {
            if (ObjectID.isValid(id)) {
                User.findById(id).then((user) => {
                    this.removeChannelFromList(user, channelId);
                })
                .catch((err) => {
                    console.log("error for " + id + err);
                });
            }
        });
    }

    incrementScore(userId) {
        User.findById(userId).then((rUser) => {
            if (rUser) {
                rUser.score += 1;
                rUser.save();
            }
        });
    }

    decrementScore(userId) {
        User.findById(userId).then((rUser) => {
            if (rUser && rUser.score > 0) {
                rUser.score -= 1;
                rUser.save();
            }
        });
    }
}

module.exports = new UserRepository();