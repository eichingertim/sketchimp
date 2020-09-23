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

class RefactoredSketch {
    constructor(sketch){
        let votes = sketch.upvotes.length - sketch.downvotes.length;
        this.name = sketch.name;
        this.creation = sketch.creation;
        this.votes = votes;
        this.data = sketch.data;
        this.finalized = sketch.finalized;
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
        return Sketch.findById(sketchId).then((sketch) =>{
            return new RefactoredSketch(sketch);
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getAllForChannelId(channelId){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        return Sketch.find({channel: channelId}).then((sketches) =>{
            let refactored = [];
            sketches.forEach(sketch => {
               refactored.push(new RefactoredSketch(sketch)); 
            });
            return refactored;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getAllFinalizedForChannelId(channelId){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        return Sketch.find({channel: channelId, finalized: true}).then((sketches) =>{
            let refactored = [];
            sketches.forEach(sketch => {
               refactored.push(new RefactoredSketch(sketch)); 
            });
            return refactored;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    getCurrentForChannelId(channelId){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        return Sketch.find({channel: channelId, finalized: false}).then((sketches) =>{
            if(sketches.length > 0){
                return sketches[0];
            }
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    finalizeCurrentForChannelId(channelId){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        return Sketch.find({channel: channelId, finalized: false}).then((sketches) =>{
            if(sketches.length > 0){
                for(let i = 0; i < sketches.length; i++){
                    sketches[i].finalized = true;
                    sketches[i].save();
                }
            }
            return;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    createNewForChannelId(channelId, SketchName){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        this.finalizeCurrentForChannelId(channelId);

        const SketchMonkey = {
            channel: channelId,
            name: SketchName,
        };

        return Sketch.create(SketchMonkey).then((rSketch) =>{
            console.log("Sketch created; ", rSketch._id);
            rSketch.save();
            return new RefactoredSketch(rSketch);
        }).catch((e) => {
            console.log("error " + e);
            return;
        });
    }

    saveSketch(Sketch){
        Sketch.save();
        return new RefactoredSketch(Sketch);
    }

    updateSketchById(SketchId, data){
        if(!ObjectID.isValid(SketchId)){
            return;
        }

        return Sketch.findById(SketchId).then((rSketch) => {
            rSketch.data = data;
            rSketch.save();
            return new RefactoredSketch(rSketch);
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    updateSketch(Sketch, data){
        if(!ObjectID.isValid(Sketch._id)){
            return;
        }
        return this.updateSketchById(Sketch._id, data);
    }

    updateCurrentSketchForChannelId(channelId, data){
        let sketchPromise = this.getCurrentForChannelId(channelId);

        if(!sketchPromise){
            return;
        }

        return sketchPromise.then((sketch) => {
            sketch.data = JSON.stringify(data);
            console.log(sketch.data);
            sketch.save();
            return new RefactoredSketch(sketch);
        })
        .catch((e) => {
            console.log(e);
            return;
        });
    }

    addUserToUpvotes(sketchId, userId){
        if(!ObjectID.isValid(sketchId) || !ObjectID.isValid(userId)){
            return;
        }
        return Sketch.findById(sketchId).then((sketch) => {
            sketch.upvotes.push(userId);
            sketch.save();
            return new RefactoredSketch(sketch);
        })
        .catch((e) => {
            console.log(e);
            return;
        });
        
    }

    addUserToDownvotes(sketchId, userId){
        if(!ObjectID.isValid(sketchId) || !ObjectID.isValid(userId)){
            return;
        }
        return Sketch.findById(sketchId).then((sketch) => {
            sketch.downvotes.push(userId);
            sketch.save();
            return new RefactoredSketch(sketch);
        })
        .catch((e) => {
            console.log(e);
            return;
        });
    }
}

module.exports = new SketchRepository();