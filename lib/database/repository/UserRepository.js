/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const {ObjectID} = require("mongodb"),
  User = require("../models/user"),
  Constants = require("../../config/Constants"),
  Observable = require("../../config/utils/Observable.js");

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
                Constants.RESPONSEMESSAGES.USER_NOT_FOUND;
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
            let userProfile = new UserProfile(
                rUser.id,
                rUser.username,
                rUser.score,
                rUser.status,
                rUser.info
            );
            if (currentUser) {
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
        } else if (!ObjectID.isValid(userId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        user.channels.push(channelId);
        this.updateLastUsedChannel(user, channelId);
    }

    updateLastUsedChannel(user, channelId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        } else if (!ObjectID.isValid(userId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        user.lastUsedChannel = channelId;
        return this.saveChanges(user);
    }

    removeChannelFromList(user, channelId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        } else if (!ObjectID.isValid(userId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
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

    async saveChanges(user) {
        return await user.save();
    }
}

module.exports = new UserRepository();