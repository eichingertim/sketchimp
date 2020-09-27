/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  dbWrapper = require("../../database/DatabaseWrapper"),
  router = express.Router();

router.get("/", (req, res) => {

  try {
    let userPromise = dbWrapper.User.getPopulatedForId(req.user._id);
    userPromise.then((rUser) => {
      if (rUser.lastUsedChannel) {
        let channelPromise = dbWrapper.Channel.getPopulatedForId(req.user.lastUsedChannel);
        channelPromise.then((rChannel) => {
          return res.render("dashboard", { channel: rChannel, user: rUser });
        })
        .catch((e)=> {
          console.log(e);
          return res.render("dashboard", { channel: undefined, user: rUser});
        });
      } else {
        return res.render("dashboard", { channel: undefined, user: rUser });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.render("serverError", { user: undefined, title: "Error" });
    });
  } catch(err) {
    console.log(err);
    return res.render("serverError", { user: undefined, title: "Error" });
  }
});

module.exports = router;