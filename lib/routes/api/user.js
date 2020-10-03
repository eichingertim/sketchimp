/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

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
                    return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.USER_NOT_FOUND));
                } 
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.USER_FOUND, targetUserProfile));
            })
            .catch((err) => {
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(err));
            });
    } catch(err) {
        return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(err));
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