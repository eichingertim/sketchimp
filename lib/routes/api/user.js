/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  { ObjectID } = require("mongodb"),
  User = require("../../models/user"),
  middleware = require("../../middleware/index"),
  Constants = require("../../config/Constants"),
  Observable = require("../../config/utils/Observable.js"),
  Event = require("../../config/utils/Event.js"),
  ApiResponse = require("../../config/utils/ApiResponse");

class UserNewEvent extends Event {
    constructor(id) {
        super("UserNew", {id: id});
    }
}

function setupRoutes(userRoute, router) {
    router.get("/:id", middleware.userIsLoggedIn, (req, res)=>{
        if(!ObjectID.isValid(req.params.id)){
            return res.json(new ApiResponse(Constants.RESPONSEMESSAGES.USER_NOT_FOUND));
        }
        User.findById(req.user._id).populate("channels").then((rUser)=>{
            User.findById(req.params.id).populate("channels").then((targetUser)=>{
                let data = {
                    "id": targetUser._id,
                    "username": targetUser.username,
                    "score": targetUser.score,
                    "status": targetUser.status,
                    "info": targetUser.info,
                    "sharedChannels": [],
                };
                rUser.channels.forEach(channel => {
                    targetUser.channels.forEach(targetChannel => {
                        if (targetChannel._id.equals(channel._id)) {
                            data.sharedChannels.push(targetChannel.name);
                        }
                    });
                });
                return res.json(new ApiResponse(Constants.RESPONSEMESSAGES.USER_FOUND, data));
            }).catch((e)=>{
                res.send(e);
            });
        });
    });
}

class UserRoute extends Observable {
    constructor() {
        super();
        this.router = express.Router();
        console.log(this.router);
        setupRoutes(this, this.router);
    }
}

module.exports = new UserRoute();