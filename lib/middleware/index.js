/* eslint-disable no-underscore-dangle */
/* eslint-env node */

const ChannelRepository = require("../repository/ChannelRepository"),
    middleware = {};

middleware.userIsLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    } else {
        res.redirect("/login");
    }
};

middleware.userIsChannelParticipant = (req, res, next) => {
    let membershipPromise = ChannelRepository.checkMembershipForUserId(req.params.id, req.user._id);
    if (membershipPromise) {
        membershipPromise.then((userIsMember) => {
            if (userIsMember !== undefined && userIsMember) {
                next();
            } else {
                res.send(403);
            }
        });
    }
    else {
        res.send(401);
    }
};

module.exports = middleware;