/* eslint-env node */

const express = require("express"),
  { ObjectID } = require("mongodb"),
  User = require("../models/user"),
  Channel = require("../models/channel"),
  middleware = require("../../middleware/index"),
  passport = require("passport"),
  router = express.Router();

router.get("/new", (req, res) => {
    res.render("createChannel", { user: req.user, title: "Channel" });
});

router.post("/new", middleware.loggedIn, (req, res) => {
    if(!ObjectID.isValid(req.user._id)) {
        return res.redirect("/");
    }
    const channel = {
        creator: req.user._id,
        name: req.body.name,
    }
    User.findById(req.user._id).then((rUser) => {
        if (!rUser){
            return res.redirect("/app/");
        }

        Channel.create(channel).then((rChannel) => {
            rUser.channels.push(rChannel._id);
            rUser.save();
            rChannel.participants.push(rUser._id);
            rChannel.save();
            res.redirect("/user/@me");
        }).catch((e)=> {
            console.log(e);
            res.redirect("back");
        });
    });
});

router.get("/:id", middleware.loggedIn, middleware.isChannelParticipant, (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).populate("creator").populate("participants").then((rChannel)=>{
        if(!rChannel){
            return res.redirect("/");
        }
        User.findById(req.user._id).then((rUser) => {
            let isParticipant = false;
            for (let i = 0; i < rChannel.participants.length; i++) {
                if (rChannel.participants[i]._id.equals(req.user._id)) {
                    isParticipant = true;
                }
            }
            res.render("channelInfo", { user: rUser, channel: rChannel, isParticipant: isParticipant, title: "Channel Page" });
        });
    })
    .catch((e)=>{
        res.redirect("/");
        console.log(e);
    });
});

router.post("/join/:id", middleware.loggedIn, (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).then((rChannel)=>{
        if(!rChannel){
            res.redirect("/");
        }
        for(let i = 0; i < rChannel.participants.length; i++){
            if(rChannel.participants[i].equals(ObjectID(req.user._id))){
                return res.redirect(`/channel/${rChannel._id}`);
            }
        }
        User.findById(req.user._id).then((rUser)=>{
            rUser.channels.push(rChannel._id);
            rUser.save();

            rChannel.participants.push(req.user._id);
            rChannel.save();
            return res.redirect(`/channel/${rChannel._id}`);
        });
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });
});

router.post("/leave/:id", middleware.loggedIn, (req, res)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).then((rChannel)=>{
        if(!rChannel){
            res.redirect("/");
        }
        User.findById(req.user._id).then((rUser)=>{
            for (let i = 0; i < rChannel.participants.length; i++) {
                if (rChannel.participants[i]._id.equals(req.user._id)) {
                    rChannel.participants.pull(rUser);
                    rChannel.save();
                    rUser.channels.pull(rChannel);
                    rUser.save();
                }
            }
            return res.redirect(`/channel/${rChannel._id}`);
        });
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });
});

module.exports = router;