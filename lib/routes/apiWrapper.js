/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  middleware = require("../middleware/index"),
  userRoute = require("./api/user"),
  channelRoute = require("./api/channel"),
  sketchRoute = require("./api/sketch");

function setupRoutes(router) {

    router.use("/user", userRoute.router);
    router.use("/channel", channelRoute.router);
    router.use("/sketch", sketchRoute.router);

}

class ApiRoute {
    constructor() {
        this.channelRoute = channelRoute;
        this.router = express.Router();
        setupRoutes(this.router);
    }
}

module.exports = new ApiRoute();