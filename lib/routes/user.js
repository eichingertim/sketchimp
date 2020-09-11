/* eslint-env node */

const express = require("express"),
  User = require("../models/user"),
  middleware = require("../../middleware/index"),
  passport = require("passport"),
  router = express.Router();

router.get("/login", (req, res) => {
    res.render("login", { title: "Login" });
});

router.post("/login", passport.authenticate("local-login", { failureRedirect: "/user/register" }), (req, res) => {
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = true;
        rUser.save();
       });
       res.redirect("/user/@me");
  });

router.get("/logout", middleware.loggedIn, (req, res)=>{
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = false;
        rUser.save();
       });
    req.logout();
    res.redirect("/user/login");
});

router.get("/register", (req, res) => {
    res.render("register", { title: "Register" });
});

router.post("/register", passport.authenticate("local-signup", {
    failureRedirect: "/user/register",
    failureFlash: true,
}), (req, res)=>{
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = true;
        rUser.save();
       });
       res.redirect("/user/@me");
});

router.get("/@me", middleware.loggedIn, (req, res)=>{
    User.findById(req.user._id).populate("channels").then((rUser)=>{
        res.render("profile", { user: rUser, title: "username" });
    }).catch((e)=>{
        res.send(e);
    });
});

module.exports = router;