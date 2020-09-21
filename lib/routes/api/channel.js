/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  { ObjectID } = require("mongodb"),
  User = require("../../models/user"),
  Channel = require("../../models/channel"),
  Observable = require("../../config/utils/Observable.js"),
  Event = require("../../config/utils/Event.js"),
  Constants = require("../../config/Constants"),
  ApiResponse = require("../../config/utils/ApiResponse"),
  middleware = require("../../middleware/index");

class ChannelNewEvent extends Event {
    constructor(id) {
        super("ChannelNew", {id: id});
    }
}

function setupRoutes(channelRoute, router) {

    router.get("/:id", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res)=>{
        if(!ObjectID.isValid(req.params.id)){
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }
    
        Channel.findById(ObjectID(req.params.id)).populate("creator").populate("participants").then((rChannel)=>{
            if(!rChannel){
                return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
            }
            User.findById(req.user._id).populate("channels").then((rUser) => {
                let data = {
                    "id": rChannel._id,
                    "name": rChannel.name,
                    "creator": rChannel.creator.username,
                    "members": [],
                    "creation": rChannel.creation,
                };
                rChannel.participants.forEach(member => {
                    data.members.push({ "id": member._id, "username": member.username, "online": member.online });
                });
                rUser.lastUsedChannel = rChannel._id;
                rUser.save();
                return res.json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CHANNEL_FOUND, data));
            });
        })
        .catch((e)=>{
            console.log(e);
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        });
    });
    
    router.post("/new/:name", middleware.userIsLoggedIn, (req, res) => {
        if(!ObjectID.isValid(req.user._id)) {
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CREATE_CHANNEL_FAIL));
        }
        const channel = {
            creator: req.user._id,
            name: req.params.name,
        };
        User.findById(req.user._id).then((rUser) => {
            if (!rUser){
                return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CREATE_CHANNEL_FAIL));
            }
    
            Channel.create(channel).then((rChannel) => {
                channelRoute.notifyAll(new ChannelNewEvent(rChannel._id));
                rUser.channels.push(rChannel._id);
                rUser.lastUsedChannel = rChannel._id;
                rUser.save();
                rChannel.participants.push(rUser._id);
                rChannel.save();
                let data = {
                    "id": rChannel._id,
                    "name": rChannel.name,
                };
                return res.json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CREATE_CHANNEL_SUCCESS, data));
            }).catch((e)=> {
                console.log(e);
                return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CREATE_CHANNEL_FAIL));
            });
        });
    });
    
    router.post("/join/:id", middleware.userIsLoggedIn, (req, res)=>{
        if(!ObjectID.isValid(req.params.id)){
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_JOIN_FAIL));
        }
    
        Channel.findById(ObjectID(req.params.id)).then((rChannel)=>{
            if(!rChannel){
                return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_JOIN_FAIL));
            }
            for(let i = 0; i < rChannel.participants.length; i++){
                if(rChannel.participants[i].equals(ObjectID(req.user._id))){
                    console.log(rChannel);
                    return res.json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_JOIN_ALREADY_MEMBER));
                }
            }
            User.findById(req.user._id).then((rUser)=>{
                rUser.channels.push(rChannel._id);
                rUser.lastUsedChannel = rChannel._id;
                rUser.save();
    
                rChannel.participants.push(req.user._id);
                rChannel.save();
                return res.json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CHANNEL_JOIN_SUCCESS));
            });
        }).catch((e)=>{
            console.log(e);
            return res.json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_JOIN_FAIL));
        });
    });
    
    router.post("/leave/:id", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res)=>{
        if(!ObjectID.isValid(req.params.id)){
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_FAIL));
        }
    
        Channel.findById(ObjectID(req.params.id)).then((rChannel)=>{
            if(!rChannel){
                return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_FAIL));
            }
            User.findById(req.user._id).then((rUser)=>{
                for (let i = 0; i < rChannel.participants.length; i++) {
                    if (rChannel.participants[i]._id.equals(req.user._id)) {
                        rChannel.participants.pull(rUser);
                        rChannel.save();
                        rUser.channels.pull(rChannel);
                        if (rUser.lastUsedChannel === rChannel._id) {
                            rUser.lastUsedChannel = rUser.channels[0];
                        }
                        rUser.save();
                    }
                }
                return res.json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_SUCCESS));
            });
        }).catch((e)=>{
            console.log(e);
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_FAIL));
        });
    });
}

class ChannelRoute extends Observable {
    constructor() {
        super();
        this.router = express.Router();
        setupRoutes(this, this.router);
    }
}

module.exports = new ChannelRoute();