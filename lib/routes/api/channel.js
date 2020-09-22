/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  ChannelRepository = require("../../repository/ChannelRepository"),
  UserRepository = require("../../repository/UserRepository"),
  Constants = require("../../config/Constants"),
  Observable = require("../../config/utils/Observable.js"),
  ApiResponse = require("../../config/utils/ApiResponse"),
  middleware = require("../../middleware/index");

function setupRoutes(channelRoute, router) {

    router.get("/:id", middleware.userIsChannelParticipant, (req, res)=>{
        let fetchPromise = ChannelRepository.getChannelProfile(req.params.id);
        if (!fetchPromise) {
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }
        fetchPromise.then((channelProfile) => {
            if (!channelProfile) {
                return res.status(500);
            }
            UserRepository.updateLastUsedChannel(req.user, channelProfile.id);
            return res.json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CHANNEL_FOUND, channelProfile));
        })
        .catch((e)=>{
            console.log(e);
            return res.json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        });
    });
    
    router.post("/new/:name", (req, res) => {
        let createChannelPromise = ChannelRepository.createNewChannel(req.params.name, req.user, channelRoute);
        if (!createChannelPromise) {
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CREATE_CHANNEL_FAIL));
        }
        createChannelPromise.then((channelProfile) => {
            UserRepository.addChannelToList(req.user, channelProfile.id);
            return res.json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CREATE_CHANNEL_SUCCESS, channelProfile));
        }).catch((e)=> {
            console.log(e);
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CREATE_CHANNEL_FAIL));
        });
    });
    
    router.post("/join/:id", (req, res)=>{
        let joinPromise = ChannelRepository.addUserToChannel(req.params.id, req.user._id);
        if (!joinPromise) {
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_JOIN_FAIL));
        }
        joinPromise.then((channelProfile) => {
            UserRepository.addChannelToList(req.user, channelProfile.id);
            return res.json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CHANNEL_JOIN_SUCCESS, channelProfile));
        }).catch((e)=>{
            console.log(e);
            return res.json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_JOIN_FAIL));
        });
    });
    
    router.post("/leave/:id", middleware.userIsChannelParticipant, (req, res)=>{
        let removePromise = ChannelRepository.removeUserFromChannel(req.params.id, req.user._id);
        if (!removePromise) {
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_FAIL));
        }
        removePromise.then((channelProfile) => {
            UserRepository.removeChannelFromList(req.user, channelProfile.id);
            return res.json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_SUCCESS, channelProfile));
        }).catch((e)=>{
            console.log(e);
            return res.json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_FAIL));
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