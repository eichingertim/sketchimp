/* eslint-env node */

const express = require("express"),
  middleware = require("../middleware/middleware"),
  loginRoute = require("./markup/login"),
  registerRoute = require("./markup/register"),
  logoutRoute = require("./markup/logout"),
  profileRoute = require("./markup/profile"),
  dashboardRoute = require("./markup/dashboard"),
  joinRoute = require("./markup/join"),
  publicFeedRoute = require("./markup/publicfeed"),
  imprintRoute = require("./markup/imprint"),
  defaultRoute = require("./markup/default");
  
function setupRoutes(router) {

    router.use("/login", loginRoute);
    router.use("/register", registerRoute);
    router.use("/logout", middleware.userIsLoggedIn, logoutRoute);
    router.use("/@me", middleware.userIsLoggedIn, profileRoute);
    router.use("/dashboard", middleware.userIsLoggedIn, dashboardRoute);
    router.use("/join", joinRoute);
    router.use("/public-feed", publicFeedRoute);
    router.use("/imprint", imprintRoute);
    router.use("/", defaultRoute);

}

class MarkupRoute {
    constructor() {
        this.router = express.Router();
        setupRoutes(this.router);
    }
}

module.exports = new MarkupRoute();