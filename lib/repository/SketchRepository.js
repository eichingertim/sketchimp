/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const {ObjectID} = require("mongodb"),
  Sketch = require("../models/sketch"),
  Observable = require("../routes/utils/Observable.js"),
  Event = require("../routes/utils/Event.js");
const sketch = require("../models/sketch");

class SketchNewEvent extends Event {
    constructor(id) {
        super("SketchNew", {id: id});
    }
}

class SketchRepository extends Observable {
    constructor() {
        super();
    }

    getAllForChannelId(channelId){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        sketch.find({channel: channelId}).then((sketches) =>{
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
        sketch.find({channel: channelId, finalized: true}).then((sketches) =>{
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
        sketch.find({channel: channelId, finalized: false}).then((sketches) =>{
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
        sketch.find({channel: channelId, finalized: false}).then((sketches) =>{
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

    createNewForChannelId(channelId, sketchName){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        this.finalizeCurrentForChannelId(channelId);

        const sketch = {
            channel: channelId,
            name: sketchName,
        };

        Sketch.create(sketch).then((rSketch) =>{
            //sketchRoute.notifyAll(new SketchNewEvent(rSketch._id));
            console.log("sketch created; ", rSketch._id);
            rSketch.save();
        }).catch((e) => {
            console.log("error " + e);
        });
    }

    saveSketch(sketch){
        sketch.save();
    }

    updateSketchById(sketchId, data){
        if(!ObjectID.isValid(sketchId)){
            return;
        }

        Sketch.findById(sketchId).then((rSketch) => {
            rSketch.data = data;
            rSketch.save();
        }).catch((e) => {
            console.log(e);
        });
    }

    updateSketch(sketch, data){
        if(!ObjectID.isValid(sketch._id)){
            return;
        }
        this.updateSketchById(sketch._id, data);
    }
}

module.exports = new SketchRepository();