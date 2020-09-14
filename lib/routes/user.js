/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  { ObjectID } = require("mongodb"),
  User = require("../models/user"),
  middleware = require("../middleware/index"),
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
       res.redirect("/dashboard");
  });

router.get("/logout", middleware.userIsLoggedIn, (req, res)=>{
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

router.get("/@me", middleware.userIsLoggedIn, (req, res)=>{
    User.findById(req.user._id).populate("channels").then((rUser)=>{
        res.render("profile", { user: rUser, title: "username" });
    }).catch((e)=>{
        res.send(e);
    });
});

router.post("/@me/update", middleware.userIsLoggedIn, (req, res)=>{
    User.findByIdAndUpdate(req.user._id, req.body.user).then(()=>{
        res.redirect("/users/@me");
    }).catch((e)=>{
        console.log(e);
        return res.redirect("/user/@me");
    });
});

router.get("/:id", middleware.userIsLoggedIn, (req, res)=>{
    if(!ObjectID.isValid(req.params.id) || req.user._id.equals(req.params.id)){
        return res.redirect("/user/@me");
    }
    User.findById(req.user._id).populate("channels").then((rUser)=>{
        User.findById(req.params.id).populate("channels").then((targetUser)=>{
            res.render("profile", { user: rUser, targetUser: targetUser, title: "profile" });
        }).catch((e)=>{
            res.send(e);
        });
    });
});

module.exports = router;