/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  User = require("../../models/user"),
  passport = require("passport"),
  router = express.Router();

router.get("/", (req, res) => {
    res.render("login", { title: "Login" });
});

router.post("/", passport.authenticate("local-login", { failureRedirect: "/register" }), (req, res) => {
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = true;
        rUser.save();
       });
       res.redirect("/dashboard");
});

module.exports = router;