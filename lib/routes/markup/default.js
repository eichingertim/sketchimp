/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  router = express.Router(),
  Constants = require("../../config/Constants");

router.get("/", (req, res) => {
  let rUser;
  if (req.user) {
    rUser = req.user;
  }
  return res.render("landing", { user: rUser, title: "Landing" });
});

router.get("/*", (req, res) => {
  return res.send(Constants.RESPONSEMESSAGES.PAGE_NOT_FOUND);
});

module.exports = router;