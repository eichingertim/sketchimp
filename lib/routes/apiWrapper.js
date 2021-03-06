/* eslint-env node */

const express = require("express"),
  middleware = require("../middleware/middleware"),
  userRoute = require("./api/user"),
  channelRoute = require("./api/channel"),
  sketchRoute = require("./api/sketch"),
  Constants = require("../config/Constants"),
  ApiResponse = require("../config/utils/ApiResponse");

/**
 * Provides an Instance wraping all Routes that serve API content as JSON
 * @param router used to configure routes for usage with express framework
 */

function setupRoutes(router) {

    router.use("/user", middleware.userIsLoggedIn, userRoute.router);
    router.use("/channel", middleware.userIsLoggedIn, channelRoute.router);
    router.use("/sketch", sketchRoute.router);
    // fallback routes
    router.get("/*", (req, res) => {
        res.status(Constants.HTTP_STATUS_CODES.NOT_FOUND).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.UNKNOWN_ROUTE));
    });
    router.post("/*", (req, res) => {
        res.status(Constants.HTTP_STATUS_CODES.NOT_FOUND).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.UNKNOWN_ROUTE));
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