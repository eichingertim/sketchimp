/* eslint-disable consistent-return */
/* eslint-env node */
// no-underscore-dangle necessary for mongoose id-property
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

// Class used for api response
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

    // adds booleans if user clicked upvote or downvote
    checkUserVotes(userId){
        this.userUpvote = checkUserIdInList(this.upvotes, userId);
        this.userDownvote = checkUserIdInList(this.downvotes, userId);
    }
}

class SketchRepository extends Observable {
    constructor() {
        super();
    }

    //Returns promise with sketch for specific id
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

    // returns promise with all sketches in one channel
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

    // returns promise with all finalized sketches in one channel
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

    // returns promise with all published sketches
    getAllPublished(){
        return Sketch.find({published: true}).then((sketches) =>{
            let refactored = [];
            sketches.forEach(sketch => {
               refactored.push(new RefactoredSketch(sketch)); 
            });
            // sort list depending on votes
            refactored.sort(function(a, b) {
                var keyA = a.votes,
                  keyB = b.votes;
                if (keyA < keyB) {
                    return 1;
                }    
                if (keyA > keyB) {
                    return -1;
                }    
                return 0;
              });
            return refactored;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    // returns promise with all published sketches and checks if user has voted for them
    getAllPublishedWithUserId(userId){
        return Sketch.find({published: true}).then((sketches) =>{
            let refactored = [],
            refactoredSketch;
            sketches.forEach(sketch => {
                refactoredSketch = new RefactoredSketch(sketch);
                refactoredSketch.checkUserVotes(userId);
                refactored.push(refactoredSketch); 
            });
            // sort list depending on votes
            refactored.sort(function(a, b) {
                var keyA = a.votes,
                  keyB = b.votes;
                if (keyA < keyB) {
                    return 1;
                }    
                if (keyA > keyB) {
                    return -1;
                }    
                return 0;
              });
            return refactored;
        }).catch((e) => {
            console.log(e);
            return;
        });
    }

    // returns promise with current sketch for channel
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

    // returns promise which finalizes and saves current sketch 
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

    // returns promise and publishes sketch
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

    // returns promise with new created sketch
    createNewForChannelId(channelId, SketchName, multilayerSketch){
        if(!ObjectID.isValid(channelId)){
            return;
        }
        const newSketch = {
            channel: channelId,
            name: SketchName,
            multilayer: multilayerSketch,
        };

        return Sketch.create(newSketch).then((rSketch) =>{
            console.log("Sketch created; ", rSketch._id);
            rSketch.save();
            return new RefactoredSketch(rSketch);
        }).catch((e) => {
            console.log("error " + e);
            return;
        });
    }

    // returns promise in which the current sketch will be saved to file system,
    // the path of the safed image will be stored to database and the sketch will be finalized
    // after that a new sketch will be created
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

    // returns promise with saved sketch with updated draw data
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

    // returns promise with saved sketch with updated draw data
    update(Sketch, data){
        if(!ObjectID.isValid(Sketch._id)){
            return;
        }
        return this.updateById(Sketch._id, data);
    }

    // returns promise with saved sketch with updated draw data for channelId
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
    // returns promise with saved sketch with updated likes
    userUpvoteClick(sketchId, userId){
        if(!ObjectID.isValid(sketchId) || !ObjectID.isValid(userId)){
            return;
        }
        return Sketch.findById(sketchId).then((sketch) => {
            // if user already is in list -> remove from it
            if(checkUserIdInList(sketch.upvotes, userId)){
                sketch.upvotes.pull(userId);
            }else{
                // otherwise if user is in downvote-list -> remove from it
                if(checkUserIdInList(sketch.downvotes, userId)){
                    sketch.downvotes.pull(userId);
                }
                // add user to upvote list
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

    // returns promise with saved sketch with updated likes
    userDownvoteClick(sketchId, userId){
        if(!ObjectID.isValid(sketchId) || !ObjectID.isValid(userId)){
            return;
        }
        return Sketch.findById(sketchId).then((sketch) => {
            // if user already is in list -> remove from it
            if(checkUserIdInList(sketch.downvotes, userId)){
                sketch.downvotes.pull(userId);
            }else{
                 // otherwise if user is in upvote-list -> remove from it
                if(checkUserIdInList(sketch.upvotes, userId)){
                    sketch.upvotes.pull(userId);
                }
                // add user to downvote list
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