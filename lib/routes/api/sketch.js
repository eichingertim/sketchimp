/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

  const express = require("express"),
  { ObjectID } = require("mongodb"),
  User = require("../../models/user"),
  Sketch = require("../../models/sketch"),
  SketchRepository = require("../../repository/SketchRepository"),
  Channel = require("../../models/channel"),
  Observable = require("../../config/utils/Observable.js"),
  Event = require("../../config/utils/Event.js"),
  middleware = require("../../middleware/index"),
  Constants = require("../../config/Constants"),
  ApiResponse = require("../../config/utils/ApiResponse");

class SketchNewEvent extends Event {
    constructor(id) {
        super("SketchNew", {id: id});
    }
}

function setupRoutes(sketchRoute, router) {
    
    //returns all sketches for delivered channel id in json format
    router.get("/all/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channel = getChannelForId(req.params.channelId),
        sketches;

        if(channel === null || channel === undefined){
            res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).send(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
            return;
        }

        sketches = SketchRepository.getAllForChannelId(req.params.channelId);
        if(sketches === null || sketches === undefined){
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            return;
        }
        res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactorSketches(sketches)));
    });

    //returns all finalized sketches for delivered channel id in json format
    router.get("/all-finalized/:channelId", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        let channel = getChannelForId(req.params.channelId),
        sketches;
        
        if(channel === null || channel === undefined){
            res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).send(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
            return;
        }

        sketches = SketchRepository.getAllFinalizedForChannelId(req.params.channelId);
        if(sketches === null || sketches === undefined){
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            return;
        }
        res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactorSketches(sketches)));
    });

    //returns current sketch for delivered channel id in json format
    router.get("/current/:channelId", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        let channel = getChannelForId(req.params.channelId),
        sketch;
        
        if(channel === null || channel === undefined){
            res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).send(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
            return;
        }

        sketch = SketchRepository.getCurrentForChannelId(req.params.channelId);
        if(sketch === null || sketch === undefined){
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            return;
        }
        res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactorSingleSketch(sketch)));
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
            res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).send(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
            return;
        }

        SketchRepository.createNewForChannelId(req.params.channelId, req.params.sketchName);
        //sketch = SketchRepository.getCurrentForChannelId(req.params.channelId);

        res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_CREATED));
    });

    //sets delivered data as data for current sketch of delivered channel
    router.post("/save/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channel = getChannelForId(req.params.channelId),
        sketch;
        
        if(channel === null || channel === undefined){
            res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).send(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
            return;
        }

        sketch = SketchRepository.getCurrentForChannelId(req.params.channelId);
        if(sketch === null || sketch === undefined){
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            return;
        }

        SketchRepository.updateSketch(sketch, req.params.data);

        res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_SAVED));
    });

    //adds current user to upvote array of the delivered sketch
    router.post("/upvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        
        let sketch = SketchRepository.getForId(req.params.sketchId);
        if(sketch === null || sketch === undefined){
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            return;
        }

        SketchRepository.addUserToUpvotes(sketch, req.user);
        res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.ADDED_TO_UPVOTES));
    });

    //adds current user to downvote array of the delivered sketch
    router.post("/downvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        
        let sketch = SketchRepository.getForId(req.params.sketchId);
        if(sketch === null || sketch === undefined){
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            return;
        }

        SketchRepository.addUserToDownvotes(sketch, req.user);
        res.status(Constants.HTTP_STATUS_CODES.OK).send(new ApiResponse(Constants.RESPONSEMESSAGES.ADDED_TO_DOWNVOTES));
    });
}

function getChannelForId(channelId){
    if(!ObjectID.isValid(channelId)){
        return;
    }
    return Channel.findById(ObjectID(channelId));
}

function refactorSingleSketch(sketch){
    if (sketch === undefined){
        return;
    }

    let votes = sketch.upvotes.length - sketch.downvotes.length,
     refactored = {
        name: sketch.name,
        creation: sketch.creation,
        votes: votes,
        data: sketch.data,
        finalized: sketch.finalized,
    };
    return refactored;
}

function refactorSketches(sketches){
    if (sketches === undefined){
        return;
    }
    let refactored = [];
    for(let i = 0; i < sketches.length; i++){
        refactored.push(refactorSingleSketch(sketches[i]));
    }
    return refactored;
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