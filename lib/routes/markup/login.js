/* eslint-env node */

const express = require("express"),
  passport = require("passport"),
  router = express.Router();

router.get("/", (req, res) => {
    let rUser;
    if (req.user) {
        rUser = req.user;
    }
    return res.render("login", { user: rUser, title: "login", err: req.flash("error") });
});

router.post("/", passport.authenticate("local-login", { failureRedirect: "/login", failureFlash: true }), (req, res) => {
    req.user.online = true;
    req.user.save();
    res.cookie("user-id", req.user._id);
    return res.redirect("/dashboard");
});

module.exports = router;