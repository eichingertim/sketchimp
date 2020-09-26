/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-env node */
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
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.getAllForChannelId(req.params.channelId);

        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketches) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketches));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            });
    });

    //returns all finalized sketches for delivered channel id in json format
    router.get("/all-finalized/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.getAllFinalizedForChannelId(req.params.channelId);

        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketches) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketches));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            });
    });

    //returns all published sketches in json format
    router.get("/all-published", (req, res) => {
        let sketchPromise; 
        if(req.user._id){
            sketchPromise = dbWrapper.Sketch.getAllPublishedWithUserId(req.user._id);
        }else{
            sketchPromise = dbWrapper.Sketch.getAllPublished();
        }

        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketches) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketches));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            });
    });



    //returns current sketch for delivered channel id in json format
    router.get("/current/:channelId", middleware.userIsLoggedIn, middleware.userIsChannelParticipant, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.getCurrentForChannelId(req.params.channelId);

        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketch));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            });
    });

    //returns id of new current sketch, older sketch will be finalized
    router.post("/new/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.createNewForChannelId(req.params.channelId, req.body.name, req.body.multilayer);
        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_CREATED, refactoredSketch));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED));
            });
    });

    //returns sketch for delivered sketchid in json format
    router.get("/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.getForId(req.params.sketchId);

        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FOUND, refactoredSketch));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
            });
    });

    //sets delivered data as data for current sketch of delivered channel
    router.post("/save/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.getCurrentForChannelId(req.params.channelId);
        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_FOUND));
        }

        sketchPromise = dbWrapper.Sketch.updateCurrentForChannelId(req.params.channelId, req.body);
        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.SKETCH_NOT_CREATED);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_SAVED));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_SAVED, refactoredSketch));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_NOT_SAVED));
            });
    });

    //adds current user to upvote array of the delivered sketch
    router.post("/upvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.addUserToUpvotes(req.params.sketchId, req.user._id);

        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.ADDED_TO_UPVOTES, refactoredSketch));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES));
            });
    });

    //adds current user to downvote array of the delivered sketch
    router.post("/downvote/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.addUserToDownvotes(req.params.sketchId, req.user._id);

        if (!sketchPromise) {
            console.log(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_DOWNVOTES);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_DOWNVOTES));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.ADDED_TO_DOWNVOTES, refactoredSketch));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_DOWNVOTES));
            });
    });

    //finalizes current sketch, saves the delivered image file and returns a new created sketch
    router.post("/finalize-create/:channelId", middleware.userIsLoggedIn, (req, res) => {
        let channelPromise = dbWrapper.Channel.getForId(req.params.channelId),
            sketchPromise;

        if (!channelPromise) {
            return res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(Constants.RESPONSEMESSAGES.CHANNEL_NOT_FOUND));
        }

        channelPromise.then(channel => {
            let dataReplaced = req.body.image.replace(/^data:image\/png;base64,/, ""),
                randomFileName = crypto.randomBytes(16).toString("hex"),
                path = Constants.UPLOAD.SKETCH.BASE_URL + randomFileName + ".png";
            fs.writeFile(path, dataReplaced, "base64", function (err) {
                if (err) {
                    throw err;
                }
            });
            sketchPromise = dbWrapper.Sketch.finalizeCurrentAndCreateNew(req.params.channelId, path, req.body.name, req.body.multilayer);
            if (!sketchPromise) {
                return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_FAILED));
            }
            sketchPromise.then((newSketch) => {
                if (newSketch) {
                    return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_SUCCESS, newSketch));
                }
            }).catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_FAILED));
            });
        }).catch(err => {
            console.log(err);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_FINALIZE_FAILED));
        });
    });

    // used to publish sketch
    router.post("/publish/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.publishForId(req.params.sketchId);

        if(!sketchPromise){
            console.log(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_FAILED));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_SUCCESS, refactoredSketch));
        })
            .catch((e) => {
                console.log(e);
                return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_FAILED));
            });
    });

    // used to publish sketch
    router.post("/publish/:sketchId", middleware.userIsLoggedIn, (req, res) => {
        let sketchPromise = dbWrapper.Sketch.publishForId(req.params.sketchId);

        if(!sketchPromise){
            console.log(Constants.RESPONSEMESSAGES.NOT_ADDED_TO_UPVOTES);
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_FAILED));
        }

        sketchPromise.then((refactoredSketch) => {
            return res.status(Constants.HTTP_STATUS_CODES.OK).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_SUCCESS, refactoredSketch));
        })
        .catch((e) => {
            console.log(e);
            return res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(Constants.RESPONSEMESSAGES.SKETCH_PUBLISH_FAILED));
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
