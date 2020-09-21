/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  User = require("../../models/user"),
  Channel = require("../../models/channel"),
  router = express.Router();

router.get("/", (req, res) => {
  User.findById(req.user._id).populate("channels").then((rUser) => {
      Channel.findById(rUser.lastUsedChannel).populate("participants").then((rChannel) => {
        if (!rChannel) {
          return res.render("dashboard", { channel: undefined, user: rUser, title: "Dashboard"});
        }
        return res.render("dashboard", { channel: rChannel, user: rUser , title: "Dashboard"});
      })
      .catch((e)=> {
        console.log(e);
        return res.render("dashboard", { channel: undefined, user: rUser, title: "Dashboard"});
      });
  }) 
  .catch((e)=> {
      console.log(e);
      return res.redirect("/");
  });
});

module.exports = router;