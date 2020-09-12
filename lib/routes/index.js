/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  User = require("../models/user"),
  middleware = require("../middleware/index"),
  router = express.Router();

  router.get("/*", middleware.userIsLoggedIn, (req, res) => {
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = true;
        rUser.save();
       });
    res.redirect("/user/@me");
});

module.exports = router;