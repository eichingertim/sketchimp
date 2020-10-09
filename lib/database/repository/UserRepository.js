/* eslint-env node */

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
        this.avatar = user.avatar;
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
        }).catch(() => {
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
        if (user.populated("lastUsedChannel")) {
            user.depopulate("lastUsedChannel");
        }
        user.lastUsedChannel = channelId;
        user.save();
        return user.lastUsedChannel;
    }

    removeChannelFromList(user, channelId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        user.channels.pull(channelId);
        if (user.channels.length > 0) {
            return this.updateLastUsedChannel(user, user.channels[0]);
        }
        this.updateLastUsedChannel(user, undefined);
        user.save();
        return undefined;
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
                .catch(() => {
                    // error removing channel from one user
                });
            }
        });
    }

    modifyScore(userId, modifier) {
        User.findById(userId).then((rUser) => {
            if (rUser) {
                rUser.score += modifier;
                rUser.save();
            }
        });
    }
}

module.exports = new UserRepository();