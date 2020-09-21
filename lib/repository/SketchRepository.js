/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const {ObjectID} = require("mongodb"),
  Sketch = require("../models/sketch"),
  Observable = require("../config/utils/Observable.js"),
  Event = require("../config/utils/Event.js");

class SketchNewEvent extends Event {
    constructor(id) {
        super("SketchNew", {id: id});
    }
}

class SketchRepository extends Observable {
    constructor() {
        super();
    }

    getForId(sketchId){
        if(!ObjectID.isValid(sketchId)){
            return;
        }
        
        Sketch.findById(sketchId).then((sketch) =>{
            return sketch;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getAllForChannelId(channelId){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        Sketch.find({channel: channelId}).then((sketches) =>{
            return sketches;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getAllFinalizedForChannelId(channelId){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        Sketch.find({channel: channelId, finalized: true}).then((sketches) =>{
            return sketches;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getCurrentForChannelId(channelId){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        Sketch.find({channel: channelId, finalized: false}).then((sketches) =>{
            if(sketches.length > 0){
                return sketches[0];
            }
        }).catch((e) => {
            console.log(e);
        });
        return;
    }

    finalizeCurrentForChannelId(channelId){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        Sketch.find({channel: channelId, finalized: false}).then((sketches) =>{
            if(sketches.length > 0){
                for(let i = 0; i < sketches.length; i++){
                    sketches[i].finalized = true;
                    sketches[i].save();
                }
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    createNewForChannelId(channelId, SketchName){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        this.finalizeCurrentForChannelId(channelId);

        const Sketch = {
            channel: channelId,
            name: SketchName,
        };

        Sketch.create(Sketch).then((rSketch) =>{
            //SketchRoute.notifyAll(new SketchNewEvent(rSketch._id));
            console.log("Sketch created; ", rSketch._id);
            rSketch.save();
        }).catch((e) => {
            console.log("error " + e);
        });
    }

    saveSketch(Sketch){
        Sketch.save();
    }

    updateSketchById(SketchId, data){
        if(!ObjectID.isValid(SketchId)){
            return;
        }

        Sketch.findById(SketchId).then((rSketch) => {
            rSketch.data = data;
            rSketch.save();
        }).catch((e) => {
            console.log(e);
        });
    }

    updateSketch(Sketch, data){
        if(!ObjectID.isValid(Sketch._id)){
            return;
        }
        this.updateSketchById(Sketch._id, data);
    }

    addUserToUpvotes(sketch, user){
        if(!ObjectID.isValid(sketch._id) || !ObjectID.isValid(user._id)){
            return;
        }
        if(!this.userIdIsInArray(sketch.upvotes, user._id)){
            sketch.upvotes.push(user._id);
            sketch.save();
        }
    }

    addUserToDownvotes(sketch, user){
        if(!ObjectID.isValid(sketch._id) || !ObjectID.isValid(user._id)){
            return;
        }

        if(!this.userIdIsInArray(sketch.downvotes, user._id)){
            sketch.downvotes.push(user._id);
            sketch.save();
        }
    }

    userIdIsInArray(array, userId){
        for(let i = 0; i < array.length; i++){
            if(array[i] === userId){
                return true;
            }
        }
        return false;
    }
}

module.exports = new SketchRepository();