/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const {ObjectID} = require("mongodb"),
  Channel = require("../models/channel"),
  Event = require("../config/utils/Event.js"),
  Observable = require("../config/utils/Observable.js");

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
        channel.participants.forEach(member => {
            this.members.push({ "id": member._id, "username": member.username, "online": member.online });
        });
    }
}

class ChannelRepository extends Observable {
    constructor() {
        super();
    }

    getForId(channelId){
        if(!ObjectID.isValid(channelId)){
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
        return Channel.findById(channelId).populate("participants").then((rChannel) =>{
            return rChannel;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getChannelProfile(channelId) {
        if(!ObjectID.isValid(channelId)){
            return;
        }
        return Channel.findById(channelId).populate("creator").populate("participants").then((rChannel) =>{
            return new ChannelProfile(rChannel);
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    createNewChannel(channelName, creator, observer) {
        return Channel.create({ creator: creator._id, name: channelName}).then((rChannel) => {
            observer.notifyAll(new ChannelNewEvent(rChannel._id));
            rChannel.participants.push(creator._id);
            rChannel.save();
            return new ChannelProfile(rChannel);
        })
        .catch((e) => {
            console.log(e);
            return;
        });
    }

    addUserToChannel(channelId, userId) {
        if(!ObjectID.isValid(channelId) || !ObjectID.isValid(userId)){
            return;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            if (rChannel.participants.includes(userId)) {
                return;
            }
            rChannel.participants.push(userId);
            rChannel.save();
            return new ChannelProfile(rChannel);
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    removeUserFromChannel(channelId, userId) {
        if(!ObjectID.isValid(channelId) || !ObjectID.isValid(userId)){
            return;
        }
        return Channel.findById(channelId).then((rChannel) =>{
            if (!rChannel.participants.includes(userId)) {
                return;
            }
            rChannel.participants.pull(userId);
            rChannel.save();
            return new ChannelProfile(rChannel);
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
            return rChannel.participants.includes(userId);
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

}

module.exports = new ChannelRepository();