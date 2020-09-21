/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  User = require("../../models/user"),
  passport = require("passport"),
  router = express.Router();

router.get("/", (req, res) => {
  let rUser;
  if (req.user) {
      rUser = req.user;
  }
  return res.render("register", { user: rUser, title: "Register" });
});

router.post("/", passport.authenticate("local-signup", { failureRedirect: "/register", failureFlash: true }), (req, res)=>{
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = true;
        rUser.save();
       });
    return res.redirect("/dashboard");
});

module.exports = router;