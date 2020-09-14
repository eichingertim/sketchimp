/* eslint-env node */

const { ObjectID } = require("mongodb"),
    Channel = require("../models/channel"),
    middleware = {};

middleware.userIsLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        next();
    } else{
        res.redirect("/user/login");
    }
};

middleware.userIsChannelParticipant = (req, res, next)=>{
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect("/");
    }

    Channel.findById(ObjectID(req.params.id)).then((rChannel)=>{
        if(!rChannel){
            return res.redirect("/");
        }
        return next();
    }).catch((e)=>{
        console.log(e);
        res.redirect("/");
    });
};

module.exports = middleware;