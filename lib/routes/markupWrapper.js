/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  middleware = require("../middleware/middleware"),
  loginRoute = require("./markup/login"),
  registerRoute = require("./markup/register"),
  logoutRoute = require("./markup/logout"),
  profileRoute = require("./markup/profile"),
  dashboardRoute = require("./markup/dashboard"),
  publicFeedRoute = require("./markup/publicfeed"),
  defaultRoute = require("./markup/default");
  
function setupRoutes(router) {

    router.use("/login", loginRoute);
    router.use("/register", registerRoute);
    router.use("/logout", middleware.userIsLoggedIn, logoutRoute);
    router.use("/@me", middleware.userIsLoggedIn, profileRoute);
    router.use("/dashboard", middleware.userIsLoggedIn, dashboardRoute);
    router.use("/public-feed", publicFeedRoute);
    router.use("/", defaultRoute);

}

class MarkupRoute {
    constructor() {
        this.router = express.Router();
        setupRoutes(this.router);
    }
}

module.exports = new MarkupRoute();