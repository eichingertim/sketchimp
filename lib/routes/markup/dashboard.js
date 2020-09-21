/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  UserRepository = require("../../repository/UserRepository"),
  ChannelRepository = require("../../repository/ChannelRepository"),
  router = express.Router();

router.get("/", (req, res) => {
  let userPromise = UserRepository.getPopulatedForId(req.user._id);
  if (!userPromise) {
    return res.render("dashboard", { channel: undefined, user: req.user, title: "Dashboard"});
  } 
  userPromise.then((rUser) => {
    let channelPromise = ChannelRepository.getPopulatedForId(req.user.lastUsedChannel);
    if (!channelPromise) {
      return res.render("dashboard", { channel: undefined, user: req.user, title: "Dashboard"});
    }
    channelPromise.then((rChannel) => {
      if (!rChannel) {
        return res.render("dashboard", { channel: undefined, user: rUser, title: "Dashboard"});
      }
      return res.render("dashboard", { channel: rChannel, user: rUser , title: "Dashboard"});
    })
    .catch((e)=> {
      console.log(e);
      return res.render("dashboard", { channel: undefined, user: rUser, title: "Dashboard"});
    });
  });
});

module.exports = router;