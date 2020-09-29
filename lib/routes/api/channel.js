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
        try {
            let fetchPromise = dbWrapper.Channel.getProfile(req.params.id);
            fetchPromise.then((channelProfile) => {
                if (!channelProfile) {
                    return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
                }
                if (req.user) {
                    dbWrapper.User.updateLastUsedChannel(req.user, channelProfile.id);
                }
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_FOUND, channelProfile));
            })
            .catch((e)=>{
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(e));
            });
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
        }
    });
    
    router.post("/new/:name", (req, res) => {
        try {
            let createChannelPromise = dbWrapper.Channel.create(req.params.name, req.user, channelRoute);
            createChannelPromise.then((channelProfile) => {
                if (req.user) {
                    dbWrapper.User.addChannelToList(req.user, channelProfile.id);
                }
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.CREATE_CHANNEL_SUCCESS, channelProfile));
            }).catch((e)=> {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(e));
            }); 
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
        }
    });
    
    router.post("/join/:id", (req, res)=>{
        try {
            let joinPromise = dbWrapper.Channel.addUser(req.params.id, req.user._id);
            joinPromise.then((channelProfile) => {
                dbWrapper.User.addChannelToList(req.user, channelProfile.id);
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_JOIN_SUCCESS, channelProfile));
            }).catch((e)=>{
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
            });
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
        }
    });
    
    router.post("/leave/:id", middleware.userIsChannelParticipant, (req, res)=>{
        try {
            let removePromise = dbWrapper.Channel.removeUser(req.params.id, req.user._id);
            removePromise.then((channelProfile) => {
                dbWrapper.User.removeChannelFromList(req.user, channelProfile.id);
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_SUCCESS, channelProfile));
            }).catch((e)=>{
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(e));
            }); 
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
        }
    });

    router.post("/kick/:id", middleware.userIsChannelCreator, (req, res)=>{
        try {
            let removePromise = dbWrapper.Channel.removeUser(req.params.id, req.body.userId);
            removePromise.then((channelProfile) => {
                dbWrapper.User.removeChannelFromAll([req.body.userId], channelProfile.id);
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_LEAVE_SUCCESS, channelProfile));
            }).catch((e)=>{
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(e));
            }); 
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
        }
    });
    
    router.post("/delete/:id", middleware.userIsChannelCreator, (req, res)=>{
        try {
            let deletePromise = dbWrapper.Channel.delete(req.params.id, req.user._id);
            deletePromise.then((memberList) => {
                dbWrapper.User.removeChannelFromList(req.user, req.params.id);
                if (memberList && memberList.length > 0) {
                    dbWrapper.User.removeChannelFromAll(memberList, req.params.id);
                }
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.DELETE_CHANNEL_SUCCESS, memberList));
            }).catch((e)=>{
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(e));
            });
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
        } 
    });

    router.post("/update/:id", middleware.userIsChannelCreator, (req, res)=>{
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
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(e));
            });
        } catch(e) {
            console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
        }
    });
    
    router.post("/upload/:id", middleware.userIsChannelAdmin, StorageWorker.uploadIcon.single(Constants.UPLOAD.AVATAR.FORM_FIELD), (req, res) => {
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
        try {
            uploadPromise = dbWrapper.Channel.setIcon(req.params.id, files[0]);
            uploadPromise.then((uploadSuccess) => {
                if (uploadSuccess) {
                    return res.redirect("/dashboard");
                }
            }).catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(e));
            });
        } catch(e) {
            console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(e));
        }
    });
    
    router.post("/roles/:id", middleware.userIsChannelAdmin, (req, res) => {
        try {
            let rolePromise = dbWrapper.Channel.changeMemberRoles(req.params.id, req.body.roleList);
            rolePromise.then((success) => {
                if (success) {
                    return res.sendStatus(Constants.HTTP_STATUS_CODES.OK);
                }
                return res.sendStatus(Constants.HTTP_STATUS_CODES.BAD_REQUEST);
            })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
            });
        } catch(e) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(e));
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
