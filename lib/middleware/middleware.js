/* eslint-disable no-underscore-dangle */
/* eslint-env node */

const dbWrapper = require("../database/DatabaseWrapper"),
    Constants = require("../config/Constants"),
    ApiResponse = require("../config/utils/ApiResponse"),
    middleware = {};

middleware.userIsLoggedIn = (req, res, next) => {
    if (Constants.API_ACCESS_KEY === req.body.api_key) {
        next();
        return;
    }
    if(req.isAuthenticated()){
        next();
    } else {
        res.redirect("/login");
    }
};

middleware.userIsChannelParticipant = (req, res, next) => {
    if (Constants.API_ACCESS_KEY === req.body.api_key) {
        next();
        return;
    }
    try {
        dbWrapper.Channel.getPopulatedForId(req.params.id).then((rChannel) => {
            if (rChannel) {
                let memberShipStatus = dbWrapper.Channel.checkMembershipForUserId(rChannel, req.user._id);
                if (memberShipStatus) {
                    req.app.locals.channel = rChannel;
                    next();
                } else {
                    res.status(Constants.HTTP_STATUS_CODES.FORBIDDEN)
                        .json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_MEMBER));
                }
            }
        })
        .catch((e) => {
            console.log(e);
            res.sendStatus(Constants.HTTP_STATUS_CODES.BAD_REQUEST);
        });
    } catch(e) {
        console.log(e);
        res.status(Constants.HTTP_STATUS_CODES.UNAUTHORIZED)
            .json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_NOT_MEMBER));
    }
};

middleware.userIsChannelAdmin = (req, res, next) => {
    if (Constants.API_ACCESS_KEY === req.body.api_key) {
        next();
        return;
    }
    try {
        dbWrapper.Channel.getPopulatedForId(req.params.id).then((rChannel) => {
            if (rChannel) {
                let memberShipStatus = dbWrapper.Channel.checkMembershipForUserId(rChannel, req.user._id);
                if (memberShipStatus === Constants.ROLES.CREATOR || memberShipStatus === Constants.ROLES.ADMIN) {
                    req.app.locals.channel = rChannel;
                    next();
                } else {
                    res.sendStatus(Constants.HTTP_STATUS_CODES.FORBIDDEN);
                }
            }
        })
        .catch((e) => {
            console.log(e);
            res.sendStatus(Constants.HTTP_STATUS_CODES.BAD_REQUEST);
        });
    } catch(e) {
        console.log(e);
        res.sendStatus(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

middleware.userIsChannelCreator = (req, res, next) => {
    try {
        dbWrapper.Channel.getPopulatedForId(req.params.id).then((rChannel) => {
            if (rChannel) {
                let memberShipStatus = dbWrapper.Channel.checkMembershipForUserId(rChannel, req.user._id);
                if (memberShipStatus === Constants.ROLES.CREATOR) {
                    req.app.locals.channel = rChannel;
                    next();
                } else {
                    res.sendStatus(Constants.HTTP_STATUS_CODES.FORBIDDEN);
                }
            }
        })
        .catch((e) => {
            console.log(e);
            res.sendStatus(Constants.HTTP_STATUS_CODES.BAD_REQUEST);
        });
    } catch(e) {
        console.log(e);
        res.sendStatus(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
};

module.exports = middleware;