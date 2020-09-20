/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  { ObjectID } = require("mongodb"),
  User = require("../../models/user"),
  Channel = require("../../models/channel"),
  middleware = require("../../middleware/index"),
  router = express.Router();

router.get("/", middleware.userIsLoggedIn, (req, res) => {
  User.findById(req.user._id).populate("channels").then((rUser) => {
      Channel.findById(rUser.lastUsedChannel).populate("participants").then((rChannel) => {
        if (!rChannel) {
          res.render("dashboard", { channel: undefined, user: rUser, title: "Dashboard"});
        }
        res.render("dashboard", { channel: rChannel, user: rUser , title: "Dashboard"});
      })
      .catch((e)=> {
        console.log(e);
        res.render("dashboard", { channel: undefined, user: rUser, title: "Dashboard"});
      });
  }) 
  .catch((e)=> {
      res.redirect("/");
      console.log(e);
  });
});

module.exports = router;