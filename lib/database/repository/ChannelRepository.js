/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const {ObjectID} = require("mongodb"),
    Channel = require("../models/channel"),
    UserRepository = require("../repository/UserRepository"),
    dbWrapper = require("../DatabaseWrapper"),
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

function checkValidRole(role) {
    if (role === Constants.ROLES.ADMIN || 
        role === Constants.ROLES.CREATOR || 
        role === Constants.ROLES.COLLABORATOR ||
        role === Constants.ROLES.VIEWER) {
        return true;
    }
    return false;
}

function findMemberRole(participants, creatorId, userId) {
    let membershipStatus;
    if (creatorId.equals(userId)) {
        membershipStatus = Constants.ROLES.CREATOR;
    } else if (participants.admins.includes(userId)) {
        membershipStatus = Constants.ROLES.ADMIN;
    } else if (participants.collaborators.includes(userId)) {
        membershipStatus = Constants.ROLES.COLLABORATOR;
    } else if (participants.viewers.includes(userId)) {
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
        return Channel.create({ creator: creator, name: channelName}).then((rChannel) => {
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

    updateForId(channelId, newName) {
        console.log(channelId);
        console.log(newName);
        if(!ObjectID.isValid(channelId)){
            throw Constants.RESPONSEMESSAGES.INVALID_USER_ID;
        }
        return Channel.findByIdAndUpdate(channelId, { name: newName }).then((rChannel) => {
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND;
            }
            return true;
        }).catch((e) => {
            console.log(e);
            throw e;
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
                throw Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND;
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
            return findMemberRole(rChannel.participants, rChannel.creator, userId);
        }).catch((e) => {
            console.log(e);
            throw e;
        });
    }

    changeMemberRoles(channelId, roleList) {
        console.log(roleList);
        if(!ObjectID.isValid(channelId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        return Channel.findById(channelId).then((rChannel) => {
            if (!rChannel) {
                throw Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND;
            }
            Object.keys(roleList).forEach((userId) => {
                if(ObjectID.isValid(userId)) {
                    let targetRole = roleList[userId];
                    if (checkValidRole(targetRole)) {
                        let memberRole = findMemberRole(rChannel.participants, rChannel.creator, userId);
                        console.log(rChannel.participants);
                        if (memberRole !== targetRole) {
                            rChannel.participants[memberRole].pull(userId);
                            rChannel.participants[targetRole].push(userId);
                        }
                        console.log(rChannel.participants);
                    }
                }
            });
            rChannel.save();
            return true;
        })
        .catch((err) => {
            throw err;
        });
    }

    incrementMemberScore(channelId) {
        if (!ObjectID.isValid(channelId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        Channel.findById(channelId).then((rChannel) => {
            if (rChannel) {
                let memberList = getMemberList(rChannel);
                memberList.push(rChannel.creator);
                if (memberList.length > 0) {
                    memberList.forEach((memberId) => {
                        UserRepository.incrementScore(memberId);
                    });
                }
            }
        })
        .catch((err) => {
            console.log(err);
            throw Constants.RESPONSEMESSAGES.CHANNEL_UPVOTE_FAIL;
        });
    }

    decrementMemberScore(channelId) {
        if (!ObjectID.isValid(channelId)) {
            throw Constants.RESPONSEMESSAGES.INVALID_CHANNEL_ID;
        }
        Channel.findById(channelId).then((rChannel) => {
            if (rChannel) {
                let memberList = getMemberList(rChannel);
                memberList.push(rChannel.creator);
                if (memberList.length > 0) {
                    memberList.forEach((memberId) => {
                        UserRepository.decrementScore(memberId);
                    });
                }
            }
        })
        .catch((err) => {
            console.log(err);
            throw Constants.RESPONSEMESSAGES.CHANNEL_UPVOTE_FAIL;
        });
    }

}

module.exports = new ChannelRepository();