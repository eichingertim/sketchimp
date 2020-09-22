/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  UserRepository = require("../../repository/UserRepository"),
  ChannelRepository = require("../../repository/ChannelRepository"),
  router = express.Router();

router.get("/", (req, res) => {
  let userPromise = UserRepository.getPopulatedForId(req.user._id);
  if (!userPromise) {
    return res.render("dashboard", { channel: undefined, user: req.user});
  } 
  userPromise.then((rUser) => {
    let channelPromise = ChannelRepository.getPopulatedForId(req.user.lastUsedChannel);
    if (!channelPromise) {
      return res.render("dashboard", { channel: undefined, user: req.user});
    }
    channelPromise.then((rChannel) => {
      if (!rChannel) {
        return res.render("dashboard", { channel: undefined, user: rUser});
      }
      return res.render("dashboard", { channel: rChannel, user: rUser });
    })
    .catch((e)=> {
      console.log(e);
      return res.render("dashboard", { channel: undefined, user: rUser});
    });
  });
});

module.exports = router;