/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  dbWrapper = require("../../database/DatabaseWrapper"),
  router = express.Router();

router.get("/:id", (req, res) => {
    try {
        let fetchPromise = dbWrapper.Channel.getForId(req.params.id);
        fetchPromise.then((rChannel) => {
            return res.render("joinChannel", { user: req.user, channel: rChannel, title: "Join Channel" });
        })
        .catch((e)=>{
            console.log(e);
            return res.render("pageNotFound", { user: req.user, title: "Page Not Found" });
        });
    } catch(e) {
        return res.render("pageNotFound", { user: req.user, title: "Page Not Found" });
    }
});

module.exports = router;