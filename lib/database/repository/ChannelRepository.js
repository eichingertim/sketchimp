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
    console.log("CALLING GETMEMBERLIST");
    let members = [];
    Object.keys((channel.participants).toJSON()).forEach((roleGroup) => {
        channel.participants[roleGroup].forEach((member) => {
            members.push(member);
        });
    });
    console.log(members);
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
            return;
        });
    }
    
    getForId(channelId){
        if(!ObjectID.isValid(channelId)) {
            return;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            return rChannel;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }
    
    getPopulatedForId(channelId) {
        if(!ObjectID.isValid(channelId)){
            return;
        }
        return Channel.findById(channelId).populate("creator")
        .populate("participants.admins")
        .populate("participants.collaborators")
        .populate("participants.viewers").then((rChannel) =>{
            return rChannel;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }
    
    getProfile(channelId) {
        if(!ObjectID.isValid(channelId)){
            return;
        }
        return Channel.findById(channelId).populate("creator")
        .populate("participants.admins")
        .populate("participants.collaborators")
        .populate("participants.viewers").then((rChannel) =>{
            return new ChannelProfile(rChannel);
        }).catch((e) => {
            console.log(e);
            return;
        });
    }
    
    create(channelName, creator, observer) {
        return Channel.create({ creator: creator._id, name: channelName}).then((rChannel) => {
            observer.notifyAll(new ChannelNewEvent(rChannel._id));
            return new ChannelProfile(rChannel);
        })
        .catch((e) => {
            console.log(e);
            return;
        });
    }
    
    delete(channelId) {
        if(!ObjectID.isValid(channelId)){
            return;
        }
        return Channel.findById(channelId).then((rChannel) => {
            return Channel.findByIdAndDelete(channelId).then((err) => {
                console.log(rChannel);
                if (!rChannel) {
                    throw err;
                }
                return getMemberList(rChannel);
            }).catch((e) => {
                console.log(e);
                return;
            })
            .catch((e) => {
                console.log(e);
                return;
            });
        });
    }
    
    addUser(channelId, userId) {
        if(!ObjectID.isValid(channelId) || !ObjectID.isValid(userId)){
            return;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            Object.keys(rChannel.participants).forEach((roleGroup) => {
                if (rChannel.participants[roleGroup].includes(userId)) {
                    return;
                }
            });
            rChannel.participants.collaborators.push(userId);
            rChannel.save();
            return new ChannelProfile(rChannel);
        }).catch((e) => {
            console.log(e);
            return;
        });
    }
    
    removeUser(channelId, userId) {
        if(!ObjectID.isValid(channelId) || !ObjectID.isValid(userId)){
            return;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            Object.keys(rChannel.participants.toJSON()).forEach((roleGroup) => {
                console.log(rChannel);
                if (rChannel.participants[roleGroup].includes(userId)) {
                    rChannel.participants[roleGroup].pull(userId);
                    rChannel.save();
                    return new ChannelProfile(rChannel);
                }
            });
            return;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }
    
    setIcon(channelId, user, imagePath) {
        if(!ObjectID.isValid(channelId) || !ObjectID.isValid(user._id)){
            return;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            rChannel.icon = imagePath;
            rChannel.save();
            return true;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }
    
    checkMembershipForUserId(channelId, userId) {
        if(!ObjectID.isValid(channelId) || !ObjectID.isValid(userId)){
            return;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            return findMemberRole(rChannel, userId);
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    changeRoleForUserId(channelId, userId, role) {
        if(!ObjectID.isValid(channelId) || !ObjectID.isValid(userId) || !Constants.ROLES.includes(role)){
            throw Constants.RESPONSEMESSAGES.INVALID_ID;
        }
        return Channel.findById(channelId).then((rChannel) => {
            let memberRole = findMemberRole(rChannel);
            if (memberRole.equals(role)) {
                throw Constants.RESPONSEMESSAGES.CHANNEL_CHANGE_ROLE_UNNECESSARY;
            }
            rChannel.participants[memberRole].pull(userId);
            return rChannel.save();
        })
        .catch((err) => {
            throw err;
        });
    }
    
}

module.exports = new ChannelRepository();