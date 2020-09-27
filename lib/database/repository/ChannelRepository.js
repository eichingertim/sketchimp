/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const {ObjectID} = require("mongodb"),
Channel = require("../models/channel"),
Constants = require("../../config/Constants"),
Event = require("../../config/utils/Event.js"),
Observable = require("../../config/utils/Observable.js");

class ChannelNewEvent extends Event {
    constructor(id) {
        super("ChannelNew", {id: id});
    }
}

function getMemberList(channel) {
    let members = [];
    Object.keys((channel.participants).toJSON()).forEach((roleGroup) => {
        channel.participants[roleGroup].forEach((member) => {
            members.push(member);
        });
    });
    return members;
}

function findMemberRole(channel, userId) {
    let membershipStatus;
    if (channel.creator.equals(userId)) {
        membershipStatus = Constants.ROLES.CREATOR;
    } else if (channel.participants.admins.includes(userId)) {
        membershipStatus = Constants.ROLES.ADMIN;
    } else if (channel.participants.collaborators.includes(userId)) {
        membershipStatus = Constants.ROLES.COLLABORATOR;
    } else if (channel.participants.viewers.includes(userId)) {
        membershipStatus = Constants.ROLES.VIEWER;
    }
    return membershipStatus;
}

class ChannelProfile {
    constructor(channel) {
        this.id = channel._id;
        this.name = channel.name;
        this.creator = ({ "id": channel.creator._id, "username": channel.creator.username, "online": channel.creator.online }) || channel.creator;
        this.creation = channel.creation;
        this.members = [];
        Object.keys((channel.participants).toJSON()).forEach((roleGroup) => {
            channel.participants[roleGroup].forEach((member) => {
                this.members.push({ "id": member._id, "username": member.username, "online": member.online, role: roleGroup });
            });
        });
    }
}

class ChannelRepository extends Observable {
    constructor() {
        super();
    }
    
    getAll() {
        return Channel.find().then((channels) => {
            return channels;
        })
        .catch((e) => {
            console.log(e);
            throw e;
        });
    }
    
    getForId(channelId){
        if(!ObjectID.isValid(channelId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            return rChannel;
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }
    
    getPopulatedForId(channelId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        return Channel.findById(channelId).populate("creator")
        .populate("participants.admins")
        .populate("participants.collaborators")
        .populate("participants.viewers").then((rChannel) =>{
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            return rChannel;
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }
    
    getProfile(channelId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        return Channel.findById(channelId).populate("creator")
        .populate("participants.admins")
        .populate("participants.collaborators")
        .populate("participants.viewers").then((rChannel) =>{
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            return new ChannelProfile(rChannel);
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }
    
    create(channelName, creator, observer) {
        let id = creator._id || undefined;
        return Channel.create({ creator: id, name: channelName}).then((rChannel) => {
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            observer.notifyAll(new ChannelNewEvent(rChannel._id));
            return new ChannelProfile(rChannel);
        })
        .catch((e) => {
            console.log(e);
            throw e;
        });
    }
    
    delete(channelId, userId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        } else if (!ObjectID.isValid(userId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        return Channel.findById(channelId).then((rChannel) => {
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            if (!rChannel.creator.equals(userId)) {
                throw Constants.RESPONSEMESSAGES.DELETE_CHANNEL_FAIL;
            }
            return Channel.findByIdAndDelete(channelId).then((err) => {
                console.log(rChannel);
                if (!rChannel) {
                    throw err;
                }
                return getMemberList(rChannel);
            }).catch((e) => {
                console.log(e);
                throw e;
            })
            .catch((e) => {
                console.log(e);
                throw e;
            });
        });
    }
    
    addUser(channelId, userId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        } else if (!ObjectID.isValid(userId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            if (rChannel.creator.equals(userId)) {
                throw Constants.RESPONSEMESSAGES.CHANNEL_JOIN_ALREADY_MEMBER;
            }
            Object.keys(rChannel.participants.toJSON()).forEach((roleGroup) => {
                if (rChannel.participants[roleGroup].includes(userId)) {
                    throw Constants.RESPONSEMESSAGES.CHANNEL_JOIN_ALREADY_MEMBER;
                }
            });
            rChannel.participants.collaborators.push(userId);
            rChannel.save();
            return new ChannelProfile(rChannel);
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }
    
    removeUser(channelId, userId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        } else if (!ObjectID.isValid(userId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            let bool = false;
            if (rChannel.creator.equals(userId)) {
                throw Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_IS_CREATOR;
            }
            Object.keys(rChannel.participants.toJSON()).forEach((roleGroup) => {
                if (rChannel.participants[roleGroup].includes(userId)) {
                    rChannel.participants[roleGroup].pull(userId);
                    rChannel.save();
                    bool = true;
                }
            });
            if (bool) {
                return new ChannelProfile(rChannel);
            } 
            throw Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_FAIL;
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }
    
    setIcon(channelId, imagePath) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            rChannel.icon = imagePath;
            rChannel.save();
            return true;
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }
    
    checkMembershipForUserId(channelId, userId) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        } else if (!ObjectID.isValid(userId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            return findMemberRole(rChannel, userId);
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }

    changeRoleForUserId(channelId, userId, targetRole) {
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        } else if (!ObjectID.isValid(userId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        let bool = false;
        Object.keys(Constants.ROLES).forEach((role) => {
            if (Constants.ROLES[role] === targetRole) {
                bool = true;
            }
        });
        if (!bool) {
            throw Constants.RESPONSEMESSAGES.CHANNEL_CHANGE_ROLE_FAIL;
        }
        return Channel.findById(channelId).then((rChannel) => {
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
            }
            let memberRole = findMemberRole(rChannel, userId);
            if (memberRole === targetRole) {
                throw Constants.RESPONSEMESSAGES.CHANNEL_CHANGE_ROLE_UNNECESSARY;
            }
            rChannel.participants[memberRole].pull(userId);
            rChannel.participants[targetRole].push(userId);
            rChannel.save();
            return new ChannelProfile(rChannel);
        })
        .catch((err) => {
            throw err;
        });
    }
    
}

module.exports = new ChannelRepository();