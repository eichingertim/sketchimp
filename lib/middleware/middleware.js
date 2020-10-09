/* eslint-env node */

const dbWrapper = require("../database/DatabaseWrapper"),
    Constants = require("../config/Constants"),
    ApiResponse = require("../config/utils/ApiResponse"),
    middleware = {};

/**
 * Allows Requests to be routed through this middleware in order to make sure the requestor has permission to access
 * passes a channel object through the req.app.locals object when necessary to reduce number of lookup requests to MongoDB
 */

/**
 * Protects routes from unauthenticated users
 */

middleware.userIsLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    } else {
        res.redirect("/login");
    }
};

/**
 * Protects routes from users that are not permitted to access a channel
 */

middleware.userIsChannelParticipant = (req, res, next) => {
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
            res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, e));
        });
    } catch(e) {
        res.status(Constants.HTTP_STATUS_CODES.UNAUTHORIZED)
            .json(new ApiResponse(0, e));
    }
};

/**
 * Protects routes from users that are allowed not administer a channel
 */

middleware.userIsChannelAdmin = (req, res, next) => {
    try {
        dbWrapper.Channel.getPopulatedForId(req.params.id).then((rChannel) => {
            if (rChannel) {
                let memberShipStatus = dbWrapper.Channel.checkMembershipForUserId(rChannel, req.user._id);
                if (memberShipStatus === Constants.ROLES.CREATOR || memberShipStatus === Constants.ROLES.ADMIN) {
                    req.app.locals.channel = rChannel;
                    next();
                } else {
                    res.status(Constants.HTTP_STATUS_CODES.FORBIDDEN).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_PERMISSION_DENIED));
                }
            }
        })
        .catch((e) => {
            res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, e));
        });
    } catch(e) {
        res.status(Constants.HTTP_STATUS_CODES.UNAUTHORIZED)
            .json(new ApiResponse(0, e));
    }
};

/**
 * Protects routes from users that are not a channels significant creator
 */

middleware.userIsChannelCreator = (req, res, next) => {
    try {
        dbWrapper.Channel.getPopulatedForId(req.params.id).then((rChannel) => {
            if (rChannel) {
                let memberShipStatus = dbWrapper.Channel.checkMembershipForUserId(rChannel, req.user._id);
                if (memberShipStatus === Constants.ROLES.CREATOR) {
                    req.app.locals.channel = rChannel;
                    next();
                } else {
                    res.status(Constants.HTTP_STATUS_CODES.FORBIDDEN).json(new ApiResponse(0, Constants.RESPONSEMESSAGES.CHANNEL_PERMISSION_DENIED));
                }
            }
        })
        .catch((e) => {
            res.status(Constants.HTTP_STATUS_CODES.BAD_REQUEST).json(new ApiResponse(0, e));
        });
    } catch(e) {
        res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(new ApiResponse(0, e));
    }
};

module.exports = middleware;