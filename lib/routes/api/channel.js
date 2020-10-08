/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
    path = require("path"),
    _ = require("lodash"),
    dbWrapper = require("../../database/DatabaseWrapper"),
    Constants = require("../../config/Constants"),
    Observable = require("../../config/utils/Observable.js"),
    ApiResponse = require("../../config/utils/ApiResponse"),
    middleware = require("../../middleware/middleware"),
    StorageWorker = require("../../storage/StorageWorker");

function setupRoutes(channelRoute, router) {
    
    router.get("/:id", middleware.userIsChannelParticipant, (req, res)=>{
        let channel = req.app.locals.channel;
        if (channel) {
            if (req.user) {
                dbWrapper.User.updateLastUsedChannel(req.user, channel._id);
            }
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CHANNEL_FOUND, dbWrapper.Channel.formChannelProfile(channel)));
        } else {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }
    });
    
    router.post("/new", (req, res) => {
        try {
            let createChannelPromise = dbWrapper.Channel.create(req.body.channelName, req.user, channelRoute);
            createChannelPromise.then((channelProfile) => {
                if (req.user) {
                    dbWrapper.User.addChannelToList(req.user, channelProfile.id);
                }
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CREATE_CHANNEL_SUCCESS, channelProfile));
            }).catch((e)=> {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, e));
            }); 
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, e));
        }
    });
    
    router.post("/join/:id", (req, res)=>{
        try {
            let joinPromise = dbWrapper.Channel.addUser(req.params.id, req.user._id);
            joinPromise.then((channelProfile) => {
                dbWrapper.User.addChannelToList(req.user, channelProfile.id);
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.CHANNEL_JOIN_SUCCESS));
            }).catch((e)=>{
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, e));
            });
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, e));
        }
    });
    
    router.post("/leave/:id", middleware.userIsChannelParticipant, (req, res)=> {
        let channel = req.app.locals.channel,
            success = false;
        if (channel.populated("participants.admins") || 
            channel.populated("participants.collaborators") || 
            channel.populated("participants.viewers")) {

            channel.depopulate("participants.admins");
            channel.depopulate("participants.collaborators");
            channel.depopulate("participants.viewers");
            channel.depopulate("creator");
        }
        try {
            if (channel) {
                if (req.user) {
                    success = dbWrapper.Channel.removeUser(channel, req.user._id);
                    dbWrapper.User.removeChannelFromList(req.user, channel._id);
                    return res.status(Constants.HTTP_STATUS_CODES.OK)
                        .json(new ApiResponse((success) ? 1 : 0, 
                            (success) ? Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_SUCCESS : Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_FAIL));
                }
            }
            return res.sendStatus(Constants.HTTP_STATUS_CODES.BAD_REQUEST);
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, e)); 
        }
    });

    router.post("/kick/:id", middleware.userIsChannelCreator, (req, res)=>{
        let channel = req.app.locals.channel,
            success = false;
        if (channel.populated("participants.admins") || 
            channel.populated("participants.collaborators") || 
            channel.populated("participants.viewers")) {

            channel.depopulate("participants.admins");
            channel.depopulate("participants.collaborators");
            channel.depopulate("participants.viewers");
            channel.depopulate("creator");
        }
        try {
            if (channel) {
                if (req.user) {
                    success = dbWrapper.Channel.removeUser(channel, req.body.userId);
                    dbWrapper.User.removeChannelFromAll([req.body.userId], channel._id);
                    return res.status(Constants.HTTP_STATUS_CODES.OK)
                        .json(new ApiResponse((success) ? 1 : 0, (success) ? Constants.RESPONSEMESSAGES.CHANNEL_KICK_SUCCESS : Constants.RESPONSEMESSAGES.CHANNEL_KICK_FAIL));
                }
            }
            return res.sendStatus(Constants.HTTP_STATUS_CODES.BAD_REQUEST);
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, e)); 
        }
    });
    
    router.delete("/delete/:id", middleware.userIsChannelCreator, (req, res)=>{
        let channel = req.app.locals.channel;
        try {
            let deletePromise = dbWrapper.Channel.delete(channel, req.user._id);
            deletePromise.then((memberList) => {
                dbWrapper.User.removeChannelFromList(req.user, channel._id);
                if (memberList && memberList.length > 0) {
                    dbWrapper.User.removeChannelFromAll(memberList, channel._id);
                }
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.DELETE_CHANNEL_SUCCESS));
            }).catch((e)=>{
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, e));
            });
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, e));
        } 
    });

    router.patch("/update/:id", middleware.userIsChannelCreator, (req, res)=>{
        try {
            let updatePromise = dbWrapper.Channel.updateForId(req.params.id, req.body.channelName);
            if (!updatePromise) {
                res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
            updatePromise.then((wasSuccessful) => {
                if (wasSuccessful) {
                    return res.sendStatus(Constants.HTTP_STATUS_CODES.OK);
                }
                return res.sendStatus(Constants.HTTP_STATUS_CODES.BAD_REQUEST);
            })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, e));
            });
        } catch(e) {
            console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, e));
        }
    });
    
    router.post("/upload/:id", middleware.userIsChannelAdmin, StorageWorker.uploadIcon.single(Constants.UPLOAD.AVATAR.FORM_FIELD), (req, res) => {
        let files,
            file = req.file.filename,
            matches = file.match(/^(.+?)_.+?\.(.+)$/i),
            channel = req.app.locals.channel;
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
        dbWrapper.Channel.setIcon(channel, files[0]);
        return res.sendStatus(Constants.HTTP_STATUS_CODES.OK);
    });
    
    router.patch("/roles/:id", middleware.userIsChannelAdmin, (req, res) => {
        let channel = req.app.locals.channel,
            success = false;
        try {
            success = dbWrapper.Channel.changeMemberRoles(channel, req.body.roleList);
            return res.sendStatus((success) ? Constants.HTTP_STATUS_CODES.OK : Constants.HTTP_STATUS_CODES.BAD_REQUEST);
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, e));
        }
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