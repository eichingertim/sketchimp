/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  User = require("../../models/user"),
  middleware = require("../../middleware/index"),
  router = express.Router();

router.get("/", middleware.userIsLoggedIn, (req, res)=>{
    User.findById(req.user._id).populate("channels").then((rUser)=>{
        return res.render("profile", { user: rUser, title: "username" });
    }).catch((e)=>{
        return res.send(e);
    });
});

router.post("/update", middleware.userIsLoggedIn, (req, res)=>{
    User.findByIdAndUpdate(req.user._id, req.body.user).then(()=>{
        return res.redirect("/@me");
    }).catch((e)=>{
        console.log(e);
        return res.redirect("/@me");
    });
});
  
module.exports = router;