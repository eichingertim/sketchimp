/* eslint-disable no-param-reassign */
/* eslint-env node */

const bcrypt = require("bcryptjs"),
    dbWrapper = require("../database/DatabaseWrapper"),
    Constants = require("../config/Constants"),

    localSignupStrategy = (req, email, password, done) => {
        
        if(email){
            email = email.toLowerCase();
        }
        process.nextTick(() => {
            if(!req.user) {
                dbWrapper.User.checkUniqueEmail(email).then((isUnique) => {
                    if (isUnique) {
                        bcrypt.genSalt(Constants.PASSWORD_HASHLENGTH, (errC, salt) => {
                            bcrypt.hash(password, salt, (errCrypt, res) => {
                                dbWrapper.User.createUser(req.body.username, email, res).then((rUser) => {
                                    return done(null, rUser);
                                })
                                .catch((err) => {
                                    return done(null, false, { message: err });
                                });
                            });
                        });
                    }
                })
                .catch((err) => {
                    return done(null, false, { message: err } );
                });
            } else if(!req.user.email){
                dbWrapper.User.checkUniqueEmail(email).then((isUnique) => {
                    if (isUnique) {
                        bcrypt.genSalt(Constants.PASSWORD_HASHLENGTH, (errC, salt)=>{
                            bcrypt.hash(password, salt, (errCrypt, res)=>{
                                    dbWrapper.User.createUser(req.user.username, email, res).then((rUser2) => {
                                        return done(null, rUser2);
                                    })
                                    .catch((err) => {
                                        return done(null, false, { message: err });
                                    });
                            });
                        });
                    }
                })
                .catch((err) => {
                    return done(null, false, { message: err} );
                });
            } else {
                return done(null, req.user);
            }
        });
    },

    localSigninStrategy = (req, email, password, done)=>{
        if(email){
            email = email.toLowerCase();
        }
        process.nextTick(() => {
            dbWrapper.User.getForEmail(email).then((rUser) => {
                if (!rUser) {
                    return done(null, false);
                }
                bcrypt.compare(password, rUser.password, (errC, res) => {
                    if (res) {
                        return done(null, rUser);
                    }
                    return done(null, false, { message: Constants.RESPONSEMESSAGES.LOGIN_FAILED });
                });
            })
            .catch((err) => {
                return done(null, false, { message: err});
            });
        });
        
    };

module.exports.localSignupStrategy = localSignupStrategy;
module.exports.localSigninStrategy = localSigninStrategy;
