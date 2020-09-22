/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  UserRepository = require("../../repository/UserRepository"),
  Constants = require("../../config/Constants"),
  Observable = require("../../config/utils/Observable.js"),
  ApiResponse = require("../../config/utils/ApiResponse");

function setupRoutes(router) {
  
    router.get("/:id", (req, res) => {
        let promise = UserRepository.getUserProfile(req.params.id, req.user);
        if (!promise) {
            return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.USER_NOT_FOUND));
        }
        promise.then((targetUserProfile) => {
            if (!targetUserProfile) {
                return res.json(new ApiResponse(0, Constants.RESPONSEMESSAGES.USER_NOT_FOUND));
            }
            return res.json(new ApiResponse(1, Constants.RESPONSEMESSAGES.USER_FOUND, targetUserProfile));
        });
    });

}

class UserRoute extends Observable {
    constructor() {
        super();
        this.router = express.Router();
        setupRoutes(this.router);
    }
}

module.exports = new UserRoute();