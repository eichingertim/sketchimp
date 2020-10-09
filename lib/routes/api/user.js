/* eslint-env node */

const express = require("express"),
  dbWrapper = require("../../database/DatabaseWrapper"),
  Constants = require("../../config/Constants"),
  Observable = require("../../config/utils/Observable.js"),
  ApiResponse = require("../../config/utils/ApiResponse");

function setupRoutes(router) {
  
    router.get("/:id", (req, res) => {
        try {
            let userPromise = dbWrapper.User.getProfile(req.params.id, req.user);
            userPromise.then((targetUserProfile) => {
                if (!targetUserProfile) {
                    return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.USER_NOT_FOUND));
                } 
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.USER_FOUND, targetUserProfile));
            })
            .catch((err) => {
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, err));
            });
    } catch(err) {
        return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, err));
    }
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