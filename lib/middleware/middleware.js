/* eslint-disable no-underscore-dangle */
/* eslint-env node */

const dbWrapper = require("../database/DatabaseWrapper"),
    Constants = require("../config/Constants"),
    middleware = {};

middleware.userIsLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    } else {
        res.redirect("/login");
    }
};

middleware.userIsChannelParticipant = (req, res, next) => {
    let membershipPromise = dbWrapper.Channel.checkMembershipForUserId(req.params.id, req.user._id);
    if (membershipPromise) {
        membershipPromise.then((userIsMember) => {
            if (userIsMember !== undefined && userIsMember) {
                next();
            } else {
                res.sendStatus(Constants.HTTP_STATUS_CODES.FORBIDDEN);
            }
        });
    }
    else {
        res.sendStatus(Constants.HTTP_STATUS_CODES.UNAUTHORIZED);
    }
};

middleware.userIsChannelCreator = (req, res, next) => {
    let membershipPromise = dbWrapper.Channel.checkMembershipForUserId(req.params.id, req.user._id);
    if (membershipPromise) {
        membershipPromise.then((userIsMember) => {
            if (userIsMember === Constants.ROLES.CREATOR) {
                next();
            } else {
                res.sendStatus(Constants.HTTP_STATUS_CODES.FORBIDDEN);
            }
        });
    }
    else {
        res.sendStatus(Constants.HTTP_STATUS_CODES.UNAUTHORIZED);
    }
};

module.exports = middleware;