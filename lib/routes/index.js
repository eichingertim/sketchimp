/* eslint-env node */

const express = require("express"),
  User = require("../models/user"),
  middleware = require("../../middleware/index"),
  passport = require("passport"),
  router = express.Router();

  router.get("/*", middleware.loggedIn, (req, res) => {
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = true;
        rUser.save();
       });
    res.redirect("/user/@me");
});

module.exports = router;