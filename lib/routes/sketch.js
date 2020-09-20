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
  middleware = require("../middleware/index"),
Channel = require("../models/channel");

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
        console.log("new");
        User.findById(req.user._id).then((rUser)=> {
            res.render("createSketch", { user: rUser, title: "Sketch" });
            //res.send("hello");
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
    
    //returns all sketches for delivered channel id in json format
    router.get("/all/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channel = getChannelForId(req.params.channelId),
        sketches;

        if(channel === null || channel === undefined){
            res.status(400).send("Channel id is not correct");
            return;
        }

        sketches = SketchRepository.getAllForChannelId(req.params.channelId);
        if(sketches === null || sketches === undefined){
            console.log("no sketch found");
            res.status(200).send("no sketch found");
            return;
        }
        res.status(200).json(sketches);
    });

    //returns all finalized sketches for delivered channel id in json format
    router.get("/all-finalized/:channelId", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        let channel = getChannelForId(req.params.channelId),
        sketches;
        
        if(channel === null || channel === undefined){
            res.status(400).send("Channel id is not correct");
            return;
        }

        sketches = SketchRepository.getAllFinalizedForChannelId(req.params.channelId);
        if(sketches === null || sketches === undefined){
            console.log("no sketch found");
            res.status(200).send("no sketch found");
            return;
        }
        res.status(200).json(sketches);
    });

    //returns current sketch for delivered channel id in json format
    router.get("/current/:channelId", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        let channel = getChannelForId(req.params.channelId),
        sketch;
        
        if(channel === null || channel === undefined){
            res.status(400).send("Channel id is not correct");
            return;
        }

        sketch = SketchRepository.getCurrentForChannelId(req.params.channelId);
        if(sketch === null || sketch === undefined){
            console.log("no sketch found");
            res.status(200).send("no sketch found");
            return;
        }
        res.status(200).json(sketch);
    });

    //get not needed?!
    router.get("/new/:channelId", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        // params: user, channel
        // response: rendered form (createSketch)
    });

    //returns id of new current sketch, older sketch will be finalized
    router.post("/new/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channel = getChannelForId(req.params.channelId),
        sketch;
        
        if(channel === null || channel === undefined){
            res.status(400).send("Channel id is not correct");
            return;
        }

        SketchRepository.createNewForChannelId(req.params.channelId, req.params.sketchName);
        sketch = SketchRepository.getCurrentForChannelId(req.params.channelId);

        res.status(200).send(sketch._id);
    });

    //sets delivered data as data for current sketch of delivered channel
    router.post("/save/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channel = getChannelForId(req.params.channelId),
        sketch;
        
        if(channel === null || channel === undefined){
            res.status(400).send("Channel id is not correct");
            return;
        }

        sketch = SketchRepository.getCurrentForChannelId(req.params.channelId);
        if(sketch === null || sketch === undefined){
            console.log("no sketch found");
            res.status(200).send("no sketch found");
            return;
        }

        SketchRepository.updateSketch(sketch, req.params.data);

        res.status(200).send("Sketch with id " + sketch._id + " successfully saved.");
    });

    //adds current user to upvote array of the delivered sketch
    router.post("/upvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        
        let sketch = SketchRepository.getForId(req.params.sketchId);
        if(sketch === null || sketch === undefined){
            console.log("no sketch found");
            res.status(200).send("no sketch found");
            return;
        }

        SketchRepository.addUserToUpvotes(sketch, req.user);
        res.status(200).send("added user to sketch upvotes with sketch id " + sketch._id);
    });

    //adds current user to downvote array of the delivered sketch
    router.post("/downvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        
        let sketch = SketchRepository.getForId(req.params.sketchId);
        if(sketch === null || sketch === undefined){
            console.log("no sketch found");
            res.status(200).send("no sketch found");
            return;
        }

        SketchRepository.addUserToDownvotes(sketch, req.user);
        res.status(200).send("added user to sketch upvotes with sketch id " + sketch._id);
    });
}

function getChannelForId(channelId){
    console.log("get channel for id: " + channelId);
    if(!ObjectID.isValid(channelId)){
        console.log("ChannelId " + channelId + " not valid");
        return;
    }
    return Channel.findById(ObjectID(channelId));
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