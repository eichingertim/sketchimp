/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  dbWrapper = require("../../database/DatabaseWrapper"),
  router = express.Router();

router.get("/", (req, res) => {
  let userPromise = dbWrapper.User.getPopulatedForId(req.user._id);
  if (!userPromise) {
    return res.render("dashboard", { channel: undefined, user: req.user});
  } 
  userPromise.then((rUser) => {
    let channelPromise = dbWrapper.Channel.getPopulatedForId(req.user.lastUsedChannel);
    if (!channelPromise) {
      return res.render("dashboard", { channel: undefined, user: req.user});
    }
    channelPromise.then((rChannel) => {
      if (!rChannel) {
        return res.render("dashboard", { channel: undefined, user: rUser});
      }
      console.log(rChannel);
      return res.render("dashboard", { channel: rChannel, user: rUser });
    })
    .catch((e)=> {
      console.log(e);
      return res.render("dashboard", { channel: undefined, user: rUser});
    });
  });
});

module.exports = router;