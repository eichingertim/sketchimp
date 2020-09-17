/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  { ObjectID } = require("mongodb"),
  User = require("../models/user"),
  Channel = require("../models/channel"),
  Observable = require("./utils/Observable.js"),
  Event = require("./utils/Event.js"),
  middleware = require("../middleware/index");

class ChannelNewEvent extends Event {
    constructor(id) {
        super("ChannelNew", {id: id});
    }
}

function setupRoutes(channelRoute, router) {
    router.get("/new", middleware.userIsLoggedIn, (req, res) => {
        User.findById(req.user._id).populate("channels").then((rUser)=> {
            res.render("createChannel", { user: rUser, title: "Channel" });
        })
        .catch((e)=>{
            res.redirect("/");
            console.log(e);
        });
    });
    
    router.post("/new", middleware.userIsLoggedIn, (req, res) => {
        if(!ObjectID.isValid(req.user._id)) {
            return res.redirect("/");
        }
        const channel = {
            creator: req.user._id,
            name: req.body.name,
        };
        User.findById(req.user._id).then((rUser) => {
            if (!rUser){
                return res.redirect("/app/");
            }
    
            Channel.create(channel).then((rChannel) => {
                channelRoute.notifyAll(new ChannelNewEvent(rChannel._id));
                rUser.channels.push(rChannel._id);
                rUser.save();
                rChannel.participants.push(rUser._id);
                rChannel.save();
                res.redirect("/dashboard");
            }).catch((e)=> {
                console.log(e);
                res.redirect("back");
            });
        });
    });
    
    router.get("/:id", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res)=>{
        if(!ObjectID.isValid(req.params.id)){
            return res.redirect("/");
        }
    
        Channel.findById(ObjectID(req.params.id)).populate("creator").populate("participants").then((rChannel)=>{
            if(!rChannel){
                return res.redirect("/");
            }
            User.findById(req.user._id).populate("channels").then((rUser) => {
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
    
    router.post("/join/:id", middleware.userIsLoggedIn, (req, res)=>{
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
    
    router.post("/leave/:id", middleware.userIsLoggedIn, (req, res)=>{
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
                return res.redirect("/dashboard");
            });
        }).catch((e)=>{
            console.log(e);
            res.redirect("/");
        });
    });
}

class ChannelRoute extends Observable {
    constructor() {
        super();
        this.router = express.Router();
        console.log(this.router);
        setupRoutes(this, this.router);
    }
}



module.exports = new ChannelRoute();