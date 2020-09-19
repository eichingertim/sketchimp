/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  { ObjectID } = require("mongodb"),
  User = require("../models/user"),
  Sketch = require("../models/sketch"),
  SketchRepository = require("../repository/SketchRepository"),
  Observable = require("./utils/Observable.js"),
  Event = require("./utils/Event.js"),
  middleware = require("../middleware/index");

class SketchNewEvent extends Event {
    constructor(id) {
        super("SketchNew", {id: id});
    }
}

function setupRoutes(sketchRoute, router) {

    //TODO: Check if user is in channel of the requested sketch
    /*router.get("/:id", middleware.userIsLoggedIn, (req, res) =>{
        if(!ObjectID.isValid(req.params.id)){
            return res.redirect("/");
        }

        Sketch.findById(ObjectID(req.params.id)).then(rSketch =>{
            if(!rSketch){
                return res.redirect("/");
            }
            return rSketch;
        })
        .catch((e)=>{
            res.redirect("/");
            console.log(e);
        });
    });   

    router.get("/new", middleware.userIsLoggedIn, (req, res) => {
        User.findById(req.user._id).then((rUser)=> {
            res.render("createSketch", { user: rUser, title: "Sketch" });
        })
        .catch((e)=>{
            res.redirect("/");
            console.log(e);
        });
    });

    router.post("/new", middleware.userIsLoggedIn, (req, res) =>{
        console.log("new");
        if(!ObjectID.isValid(req.user._id)){
            console.log("new sketch user not valid");
            return res.redirect("/");
        }

        const sketch = {
            channel: req.channel._id,
            name: req.body.name,
        };

        User.findById(req.user._id).then((rUser) =>{
            if (!rUser){
                console.log("no user");
                return res.redirect("/app/");
            }

            Sketch.create(sketch).then((rSketch) =>{
                sketchRoute.notifyAll(new SketchNewEvent(rSketch._id));
                console.log("sketch created; ", rSketch._id);
                rSketch.save();
                res.redirect("/dashboard");
                
            }).catch((e) => {
                console.log("error " + e);
                res.redirect("back");
            });
        });
    });

    router.get("/all/:id", middleware.userIsLoggedIn, (req, res) =>{
        if(!ObjectID.isValid(req.params.id)){
            return res.redirect("/");
        }

        Sketch.find({channel: req.params.id}).then((rSketches) =>{
            return rSketches;
        }).catch((e) => {
            console.log(e);
            res.redirect("back");
        });
    });*/
    
    router.get("/all", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        // params: user, channel
        // response: ?
    });

    router.get("/all-finalized", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        // params: user, channel
        // response: ?
    });

    router.get("/current", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        // params: user, channel
        // response: ?
    });

    router.get("/new", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        // params: user, channel
        // response: rendered form (createSketch)
    });

    router.post("/new", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        // params: user, channel, name
        // response: redirect dashboard
    });

    router.post("/save", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        // params: user, channel, sketch
        // response: redirect dashboard
    });
}

class SketchRoute extends Observable {
    constructor() {
        super();
        this.router = express.Router();
        console.log(this.router);
        setupRoutes(this, this.router);
    }
}

module.exports = new SketchRoute();