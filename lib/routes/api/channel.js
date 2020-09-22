/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  path = require("path"),
  _ = require("lodash"),
  ChannelRepository = require("../../repository/ChannelRepository"),
  UserRepository = require("../../repository/UserRepository"),
  Constants = require("../../config/Constants"),
  Observable = require("../../config/utils/Observable.js"),
  ApiResponse = require("../../config/utils/ApiResponse"),
  middleware = require("../../middleware/index"),
  StorageWorker = require("../../storage/StorageWorker");

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
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
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

    router.post("/:id/upload", StorageWorker.upload.single(Constants.AVATAR_FIELD), (req, res) => {
        let files,
            file = req.file.filename,
            matches = file.match(/^(.+?)_.+?\.(.+)$/i),
            uploadPromise;
        if (matches) {
            files = _.map(["lg", "md", "sm"], (size) => {
                return matches[1] + "_" + size + "." + matches[2];
            });
        } else {
            files = [file];
        }
        files = _.map(files, (file) => {
            let port = 8000,
                base = req.protocol + "://" + req.hostname + ":" + port,
                url = path.join(req.file.baseUrl, file).replace(/^[\\\/]+/g, "/").replace(/^[\/]+/g, "");
            return (req.file.storage === "local" ? base : "") + "/" + url;
        });
        uploadPromise = ChannelRepository.setChannelIcon(req.params.id, req.user, files[0]);
        if (!uploadPromise) {
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_ICON_UPLOAD_FAIL));
        }
        uploadPromise.then((uploadSuccess) => {
            if (uploadSuccess) {
                return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_ICON_UPLOAD_SUCCESS));
            }
        }).catch((e) => {
            console.log(e);
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_ICON_UPLOAD_FAIL));
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