/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  passport = require("passport"),
  router = express.Router();

router.get("/", (req, res) => {
    let rUser;
    if (req.user) {
        rUser = req.user;
    }
    return res.render("login", { user: rUser });
});

router.post("/", passport.authenticate("local-login", { failureRedirect: "/register" }), (req, res) => {
    req.user.online = true;
    req.user.save();
    return res.redirect("/dashboard");
});

module.exports = router;