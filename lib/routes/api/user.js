/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  DatabaseWrapper = require("../../database/DatabaseWrapper"),
  Constants = require("../../config/Constants"),
  Observable = require("../../config/utils/Observable.js"),
  ApiResponse = require("../../config/utils/ApiResponse");

function setupRoutes(router) {
  
    router.get("/:id", (req, res) => {
        let promise = DatabaseWrapper.User.getProfile(req.params.id, req.user);
        if (!promise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.USER_NOT_FOUND));
        }
        promise.then((targetUserProfile) => {
            if (!targetUserProfile) {
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.USER_NOT_FOUND));
            }
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.USER_FOUND, targetUserProfile));
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