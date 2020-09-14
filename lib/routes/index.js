/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  { ObjectID } = require("mongodb"),
  User = require("../models/user"),
  Channel = require("../models/channel"),
  middleware = require("../middleware/index"),
  router = express.Router();

router.get("/dashboard", middleware.userIsLoggedIn, (req, res) => {
  User.findById(req.user._id).populate("channels").then((rUser) => {
      res.render("dashboard", { user: rUser , title: "Dashboard"});
  }) 
  .catch((e)=> {
      res.redirect("/");
      console.log(e);
  });
});

// router.get("/dashboard/:channelID", middleware.userIsLoggedIn, (req, res) => {
//   if(!ObjectID.isValid(req.params.channelID)){
//         return res.redirect("/");
//     }

//     Channel.findById(ObjectID(req.params.channelID)).populate("creator").populate("participants").then((rChannel)=>{
//         if(!rChannel){
//             return res.redirect("/");
//         }
//         User.findById(req.user._id).populate("channels").then((rUser) => {
//             let isParticipant = false;
//             for (let i = 0; i < rChannel.participants.length; i++) {
//                 if (rChannel.participants[i]._id.equals(req.user._id)) {
//                     isParticipant = true;
//                 }
//             }
//             res.render("dashboard", { user: rUser, channel: rChannel, isParticipant: isParticipant, title: "Dashboard with Channel" });
//         });
//   })
//   .catch((e)=>{
//       res.redirect("/");
//       console.log(e);
//   });
//});

router.get("/*", middleware.userIsLoggedIn, (req, res) => {
  User.findById(req.user._id).then((rUser)=>{
      rUser.online = true;
      rUser.save();
      });
  res.redirect("/user/@me");
});

module.exports = router;