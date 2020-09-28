/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  middleware = require("../middleware/middleware"),
  userRoute = require("./api/user"),
  channelRoute = require("./api/channel"),
  sketchRoute = require("./api/sketch"),
  Constants = require("../config/Constants"),
  ApiResponse = require("../config/utils/ApiResponse");

function setupRoutes(router) {

    router.use("/user", middleware.userIsLoggedIn, userRoute.router);
    router.use("/channel", middleware.userIsLoggedIn, channelRoute.router);
    router.use("/sketch", sketchRoute.router);
    router.get("/*", (req, res) => {
        res.status(Constants.HTTP_STATUS_CODES.NOT_FOUND).json(new ApiResponse(Constants.RESPONSEMESSAGES.UNKNOWN_ROUTE));
    });
    router.post("/*", (req, res) => {
        res.status(Constants.HTTP_STATUS_CODES.NOT_FOUND).json(new ApiResponse(Constants.RESPONSEMESSAGES.UNKNOWN_ROUTE));
    });
}

class ApiRoute {
    constructor() {
        this.channelRoute = channelRoute;
        this.router = express.Router();
        setupRoutes(this.router);
    }
}

module.exports = new ApiRoute();