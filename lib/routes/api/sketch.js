/* eslint-env node */

const express = require("express"),
crypto = require("crypto"),
dbWrapper = require("../../database/DatabaseWrapper"),
Constants = require("../../config/Constants"),
Observable = require("../../config/utils/Observable.js"),
ApiResponse = require("../../config/utils/ApiResponse"),
middleware = require("../../middleware/middleware"),
fs = require("fs");

function setupRoutes(sketchRoute, router) {
    
    //returns all sketches for delivered channel id in json format
    router.get("/all/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
        sketchPromise;
        
        // return with error if channel can't be loaded
        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }
        
        sketchPromise = dbWrapper.Sketch.getAllForChannelId(req.params.channelId);
        
        // return with error if sketch can't be loaded
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }
        
        sketchPromise.then((refactoredSketches) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketches));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND, e));
        });
    });
    
    //returns all finalized sketches for delivered channel id in json format
    router.get("/all-finalized/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
        sketchPromise;
        
        // return if channel can't be loaded
        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }
        
        sketchPromise = dbWrapper.Sketch.getAllFinalizedForChannelId(req.params.channelId);
        
        // return if sketches can't be loaded
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }
        
        sketchPromise.then((refactoredSketches) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketches));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND, e));
        });
    });
    
    //returns all published sketches in json format
    router.get("/all-published", (req, res) => {
        let sketchPromise;

        // if there is an user logged in get sketches with votes for this user
        if(req.user){
            sketchPromise = dbWrapper.Sketch.getAllPublishedWithUserId(req.user._id);
        }else{
            sketchPromise = dbWrapper.Sketch.getAllPublished();
        }
        
        // return if sketches can't be loaded
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }
        
        // return sketches 
        sketchPromise.then((refactoredSketches) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketches));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND,e));
        });
    });
    
    //returns current sketch for delivered channel id in json format
    router.get("/current/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
        sketchPromise;
        
        // return if channel can't be loaded
        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }
        
        sketchPromise = dbWrapper.Sketch.getCurrentForChannelId(req.params.channelId);
        
        // return if sketch can't be loaded
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }
        
        // return sketch
        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketch));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND, e));
        });
    });
    
    //returns id of new current sketch, older sketch will be finalized
    router.post("/new/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
        sketchPromise;
        
        // return if channel can't be loaded
        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }
        
        sketchPromise = dbWrapper.Sketch.createNewForChannelId(req.params.channelId, req.body.name, req.body.multilayer);
        // return if sketch cant be created and loaded
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED));
        }
        
        // return sketch
        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_CREATED, refactoredSketch));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED, e));
        });
    });
    
    //returns sketch for delivered sketchid in json format
    router.get("/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.getForId(req.params.sketchId);
        
        // return if sketch can't be loaded
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }
        
        // return sketch data
        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketch));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND, e));
        });
    });
    
    //sets delivered data as data for current sketch of delivered channel
    router.post("/save/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
        sketchPromise;
        
        // return if channel can't be loaded
        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }
        
        sketchPromise = dbWrapper.Sketch.getCurrentForChannelId(req.params.channelId);
        // return if current sketch can't be loaded
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }
        
        sketchPromise = dbWrapper.Sketch.updateCurrentForChannelId(req.params.channelId, req.body);
        // return if current sketch can't be updated and loaded
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_SAVED));
        }
        
        // return updated sketch
        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_SAVED, refactoredSketch));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_SAVED, e));
        });
    });
    
    //adds current user to upvote array of the delivered sketch
    router.post("/upvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.userUpvoteClick(req.params.sketchId, req.user._id);
        
        // return if upvoteclick can't be performed
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES));
        }
        
        // return updated sketch
        sketchPromise.then((refactoredSketch) => {
            // collect votes for the requesting user -> used for frontend likebutton behaviour
            refactoredSketch.checkUserVotes(req.user._id);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.ADDED_TO_UPVOTES, refactoredSketch));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES, e));
        });
    });
    
    //adds current user to downvote array of the delivered sketch
    router.post("/downvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.userDownvoteClick(req.params.sketchId, req.user._id);
        
        // return if downvoteclick can't be performed
        if (!sketchPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.NOT_ADDED_TO_DOWNVOTES));
        }
        
        // return updated sketch
        sketchPromise.then((refactoredSketch) => {
            // collect votes for the requesting user -> used for frontend likebutton behaviour
            refactoredSketch.checkUserVotes(req.user._id);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.ADDED_TO_DOWNVOTES, refactoredSketch));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.NOT_ADDED_TO_DOWNVOTES, e));
        });
    });
    
    //finalizes current sketch, saves the delivered image file and returns a new created sketch
    router.post("/finalize-create/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
        sketchPromise;
        
        // return if channel can't be loaded
        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }
        
        channelPromise.then(channel => {
            if (channel) {
                // replace fileheader to save as png
                let dataReplaced = req.body.image.replace(/^data:image\/png;base64,/, ""),
                randomFileName = crypto.randomBytes(Constants.CRYPTO_HEX).toString("hex"),
                path = Constants.UPLOAD.SKETCH.BASE_URL + randomFileName + ".png";
                // write sketch as png to disk
                fs.writeFile(path, dataReplaced, "base64", function (err) {
                    if (err) {
                        throw err;
                    }
                });
                // finalize database entry for sketch and return new created
                sketchPromise = dbWrapper.Sketch.finalizeCurrentAndCreateNew(req.params.channelId, path, req.body.name, req.body.multilayer);
                // return if finalize operation went wrong
                if (!sketchPromise) {
                    return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_FAILED));
                }
                sketchPromise.then((newSketch) => {
                    // return new created sketch
                    if (newSketch) {
                        return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_SUCCESS, newSketch));
                    }
                }).catch((e) => {
                    return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_FAILED, e));
                });
            }
        }).catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_FAILED,e));
        });
    });
    
    // used to publish sketch
    router.post("/publish/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.publishForId(req.params.sketchId);
        
        // return if sketch can't be published
        if(!sketchPromise){
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_FAILED));
        }
        
        // return updated sketch
        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_SUCCESS, refactoredSketch));
        })
        .catch((e) => {
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_FAILED, e));
        });
    });
}

class SketchRoute extends Observable {
    constructor() {
        super();
        this.router = express.Router();
        setupRoutes(this, this.router);
    }
}

module.exports = new SketchRoute();
