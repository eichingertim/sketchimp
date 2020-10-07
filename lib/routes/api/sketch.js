/* eslint-disable consistent-return */
/* eslint-env node */
// no-underscore-dangle necessary for mongoose id-property
/* eslint-disable no-underscore-dangle */

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

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.getAllForChannelId(req.params.channelId);

        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketches) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketches));
        })
        .catch((e) => {
            //console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND, e));
        });
    });

    //returns all finalized sketches for delivered channel id in json format
    router.get("/all-finalized/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.getAllFinalizedForChannelId(req.params.channelId);

        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketches) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketches));
        })
        .catch((e) => {
            //console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND, e));
        });
    });

    //returns all published sketches in json format
    router.get("/all-published", (req, res) => {
        let sketchPromise;
        if(req.user){
            sketchPromise = dbWrapper.Sketch.getAllPublishedWithUserId(req.user._id);
        }else{
            sketchPromise = dbWrapper.Sketch.getAllPublished();
        }

        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketches) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketches));
        })
        .catch((e) => {
            //console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND,e));
        });
    });

    //returns current sketch for delivered channel id in json format
    router.get("/current/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.getCurrentForChannelId(req.params.channelId);

        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketch));
        })
        .catch((e) => {
            //console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND, e));
        });
    });

    //returns id of new current sketch, older sketch will be finalized
    router.post("/new/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.createNewForChannelId(req.params.channelId, req.body.name, req.body.multilayer);
        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_CREATED, refactoredSketch));
        })
        .catch((e) => {
            //console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED, e));
        });
    });

    //returns sketch for delivered sketchid in json format
    router.get("/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.getForId(req.params.sketchId);

        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketch));
        })
        .catch((e) => {
            //console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND, e));
        });
    });

    //sets delivered data as data for current sketch of delivered channel
    router.post("/save/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.getCurrentForChannelId(req.params.channelId);
        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.updateCurrentForChannelId(req.params.channelId, req.body);
        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_SAVED));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_SAVED, refactoredSketch));
        })
        .catch((e) => {
            //console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_NOT_SAVED, e));
        });
    });

    //adds current user to upvote array of the delivered sketch
    router.post("/upvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.userUpvoteClick(req.params.sketchId, req.user._id);

        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES));
        }

        sketchPromise.then((refactoredSketch) => {
            refactoredSketch.checkUserVotes(req.user._id);
            dbWrapper.Channel.incrementMemberScore(refactoredSketch.channel);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.ADDED_TO_UPVOTES, refactoredSketch));
        })
        .catch((e) => {
            //console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES, e));
        });
    });

    //adds current user to downvote array of the delivered sketch
    router.post("/downvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.userDownvoteClick(req.params.sketchId, req.user._id);

        if (!sketchPromise) {
            //console.log(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_DOWNVOTES);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.NOT_ADDED_TO_DOWNVOTES));
        }

        sketchPromise.then((refactoredSketch) => {
            refactoredSketch.checkUserVotes(req.user._id);
            dbWrapper.Channel.decrementMemberScore(refactoredSketch.channel);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.ADDED_TO_DOWNVOTES, refactoredSketch));
        })
        .catch((e) => {
            //console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.NOT_ADDED_TO_DOWNVOTES, e));
        });
    });

    //finalizes current sketch, saves the delivered image file and returns a new created sketch
    router.post("/finalize-create/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        // eslint-disable-next-line no-unused-vars 
        channelPromise.then(channel => {
            let dataReplaced = req.body.image.replace(/^data:image\/png;base64,/, ""),
                randomFileName = crypto.randomBytes(Constants.CRYPTO_HEX).toString("hex"),
                path = Constants.UPLOAD.SKETCH.BASE_URL + randomFileName + ".png";
            fs.writeFile(path, dataReplaced, "base64", function (err) {
                if (err) {
                    throw err;
                }
            });
            sketchPromise = dbWrapper.Sketch.finalizeCurrentAndCreateNew(req.params.channelId, path, req.body.name, req.body.multilayer);
            if (!sketchPromise) {
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_FAILED));
            }
            sketchPromise.then((newSketch) => {
                if (newSketch) {
                    return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_SUCCESS, newSketch));
                }
            }).catch((e) => {
                //console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_FAILED, e));
            });
        }).catch((e) => {
            //console.log(err);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_FAILED,e));
        });
    });

    // used to publish sketch
    router.post("/publish/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.publishForId(req.params.sketchId);

        if(!sketchPromise){
            //console.log(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_FAILED));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(1, Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_SUCCESS, refactoredSketch));
        })
        .catch((e) => {
            //console.log(e);
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
