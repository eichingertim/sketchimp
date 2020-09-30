/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const {ObjectID} = require("mongodb"),
  Sketch = require("../models/sketch"),
  Observable = require("../../config/utils/Observable.js");

function checkUserIdInList(list, userId){
    if(list){
        if(list.includes(userId)){
            return true;
        }
    }
    return false;
}

class RefactoredSketch {
    constructor(sketch){
        let votes = sketch.upvotes.length - sketch.downvotes.length;
        this.id = sketch._id;
        this.name = sketch.name;
        this.creation = sketch.creation;
        this.votes = votes;
        this.upvotes = sketch.upvotes;
        this.downvotes = sketch.downvotes;
        this.data = sketch.data;
        this.multilayer = sketch.multilayer;
        this.path = sketch.path;
        this.finalized = sketch.finalized;
        this.published = sketch.published;
        this.channel = sketch.channel._id || sketch.channel;
    }

    checkUserVotes(userId){
        this.userUpvote = checkUserIdInList(this.upvotes, userId);
        this.userDownvote = checkUserIdInList(this.downvotes, userId);
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

    getAllPublished(){
        return Sketch.find({published: true}).then((sketches) =>{
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

    getAllPublishedWithUserId(userId){
        return Sketch.find({published: true}).then((sketches) =>{
            let refactored = [],
            refactoredSketch;
            sketches.forEach(sketch => {
                refactoredSketch = new RefactoredSketch(sketch);
                refactoredSketch.checkUserVotes(userId);
                refactored.push(refactoredSketch); 
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

    publishForId(sketchId){
        if(!ObjectID.isValid(sketchId)){
            return;
        }
        return Sketch.findById(sketchId).then((sketch) =>{
            sketch.published = true;
            sketch.save();
            return;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    createNewForChannelId(channelId, SketchName, multilayerSketch){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        const SketchMonkey = {
            channel: channelId,
            name: SketchName,
            multilayer: multilayerSketch,
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

    finalizeCurrentAndCreateNew(channelId, filePath, newSketchName, multilayerSketch){
        if(!ObjectID.isValid(channelId) || !filePath){
            return;
        }
        return this.getCurrentForChannelId(channelId).then((rSketch) => {
            rSketch.multilayer = multilayerSketch;
            rSketch.path = filePath;
            rSketch.finalized = true;
            rSketch.data = "";
            rSketch.save();
            return this.createNewForChannelId(channelId, newSketchName, multilayerSketch);
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    save(Sketch){
        Sketch.save();
        return new RefactoredSketch(Sketch);
    }

    updateById(SketchId, data){
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

    update(Sketch, data){
        if(!ObjectID.isValid(Sketch._id)){
            return;
        }
        return this.updateById(Sketch._id, data);
    }

    updateCurrentForChannelId(channelId, data){
        let sketchPromise = this.getCurrentForChannelId(channelId);

        if(!sketchPromise){
            return;
        }

        return sketchPromise.then((sketch) => {
            sketch.data = JSON.stringify(data);
            sketch.save();
            return new RefactoredSketch(sketch);
        })
        .catch((e) => {
            console.log(e);
            return;
        });
    }

    userUpvoteClick(sketchId, userId){
        if(!ObjectID.isValid(sketchId) || !ObjectID.isValid(userId)){
            return;
        }
        return Sketch.findById(sketchId).then((sketch) => {

            if(checkUserIdInList(sketch.upvotes, userId)){
                sketch.upvotes.pull(userId);
            }else{
                if(checkUserIdInList(sketch.downvotes, userId)){
                    sketch.downvotes.pull(userId);
                }
                sketch.upvotes.push(userId);
            }
            sketch.save();
            return new RefactoredSketch(sketch);
        })
        .catch((e) => {
            console.log(e);
            return;
        });
    }

    userDownvoteClick(sketchId, userId){
        if(!ObjectID.isValid(sketchId) || !ObjectID.isValid(userId)){
            return;
        }
        return Sketch.findById(sketchId).then((sketch) => {
            if(checkUserIdInList(sketch.downvotes, userId)){
                sketch.downvotes.pull(userId);
            }else{
                if(checkUserIdInList(sketch.upvotes, userId)){
                    sketch.upvotes.pull(userId);
                }
                sketch.downvotes.push(userId);
            }
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