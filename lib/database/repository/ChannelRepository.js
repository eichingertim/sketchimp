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

class ChannelProfile {
    constructor(channel) {
        this.id = channel._id;
        this.name = channel.name;
        this.creator = channel.creator.username || channel.creator;
        this.creation = channel.creation;
        this.members = [];
        Object.keys((channel.participants).toJSON()).forEach((roleGroup) => {
            channel.participants[roleGroup].forEach((member) => {
                this.members.push({ "id": member._id, "username": member.username, "online": member.online });
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
            rChannel.participants.admins.push(creator._id);
            rChannel.save();
            return new ChannelProfile(rChannel);
        })
        .catch((e) => {
            console.log(e);
            return;
        });
    }

    addUser(channelId, userId) {
        if(!ObjectID.isValid(channelId) || !ObjectID.isValid(userId)){
            return;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            Object.entries(rChannel.participants).forEach((roleGroup) => {
                if (roleGroup.includes(userId)) {
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
            Object.keys(rChannel.participants).forEach((roleGroup) => {
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
            let membershipStatus;
            if (rChannel.participants.admins.includes(userId)) {
                membershipStatus = Constants.ROLES.ADMIN;
            } else if (rChannel.participants.collaborators.includes(userId)) {
                membershipStatus = Constants.ROLES.COLLABORATOR;
            } else if (rChannel.participants.viewers.includes(userId)) {
                membershipStatus = Constants.ROLES.VIEWER;
            }
            return membershipStatus;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

}

module.exports = new ChannelRepository();