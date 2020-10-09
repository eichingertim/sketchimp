/* eslint-env node */

const bcrypt = require("bcryptjs"),
    dbWrapper = require("../database/DatabaseWrapper"),
    Constants = require("../config/Constants"),

    localSignupStrategy = (req, email, password, done) => {
        let lowerCaseEmail;
        if(email){
            lowerCaseEmail = email.toLowerCase();
        }
        process.nextTick(() => {
            if(!req.user) {
                try {
                    dbWrapper.User.checkUniqueEmail(lowerCaseEmail).then((isUnique) => {
                        if (isUnique) {
                            bcrypt.genSalt(Constants.PASSWORD_HASHLENGTH, (errC, salt) => {
                                bcrypt.hash(password, salt, (errCrypt, res) => {
                                    dbWrapper.User.createUser(req.body.username, lowerCaseEmail, res).then((rUser) => {
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
                } catch (err) {
                    return done(null, false, { message: err});
                }
            } else if(!req.user.email){
                try {
                dbWrapper.User.checkUniqueEmail(lowerCaseEmail).then((isUnique) => {
                    if (isUnique) {
                        bcrypt.genSalt(Constants.PASSWORD_HASHLENGTH, (errC, salt)=>{
                            bcrypt.hash(password, salt, (errCrypt, res)=>{
                                    dbWrapper.User.createUser(req.user.username, lowerCaseEmail, res).then((rUser2) => {
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
            } catch(err) {
                return done(null, false, { message: err });
            }
            } else {
                return done(null, req.user);
            }
        });
    },
    
    localSigninStrategy = (req, email, password, done)=>{
        let lowerCaseEmail;
        if(email){
            lowerCaseEmail = email.toLowerCase();
        }
        process.nextTick(() => {
            try {
                dbWrapper.User.getForEmail(lowerCaseEmail).then((rUser) => {
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
            } catch(err) {
                return done(null, false, { message: err});
            }
        });
    };

module.exports.localSignupStrategy = localSignupStrategy;
module.exports.localSigninStrategy = localSigninStrategy;
