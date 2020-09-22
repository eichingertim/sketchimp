/* eslint-disable no-param-reassign */
/* eslint-env node */

const bcrypt = require("bcryptjs"),
    UserRepository = require("../repository/UserRepository"),
    Constants = require("../config/Constants"),

    localSignupStrategy = (req, email, password, done) => {

        if(email){
            email = email.toLowerCase();
        }
        process.nextTick(() => {
            if(!req.user) {
                try {
                    UserRepository.getForEmail(email).then((rUser) => {
                        if (rUser) {
                            return done(null, false, { message: "User already registered" });
                        }
                    });
                } catch(err) {
                    return done(err);
                }
                bcrypt.genSalt(Constants.PASSWORD_HASHLENGTH, (errC, salt) => {
                    bcrypt.hash(password, salt, (errCrypt, res) => {
                        try {
                            UserRepository.createUser(req.body.username, email, res).then((rUser) => {
                                return done(null, rUser);
                            });
                        } catch(err) {
                            return done(err);
                        }
                    });
                });
            } else if(!req.user.email){
                try {
                    UserRepository.getForEmail(email).then((rUser) => {
                        if (rUser) {
                            return done(null, false);
                        }
                    });
                } catch(err) {
                    return done(err);
                }
                bcrypt.genSalt(Constants.PASSWORD_HASHLENGTH, (errC, salt)=>{
                    bcrypt.hash(password, salt, (errCrypt, res)=>{
                        try {
                            UserRepository.createUser(req.user.username, email, res).then((rUser2) => {
                                return done(null, rUser2);
                            });
                        } catch(err) {
                            return done(err);
                        }
                    });
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
            try {
                UserRepository.getForEmail(email).then((rUser) => {
                    if (!rUser) {
                        return done(null, false);
                    }
                    bcrypt.compare(password, rUser.password, (errC, res) => {
                        if (res) {
                            return done(null, rUser);
                        }
                        return done(null, false);
                    });
                });
            } catch(err) {
                return done(err);
            }
        });

    };

module.exports.localSignupStrategy = localSignupStrategy;
module.exports.localSiginStrategy = localSigninStrategy;
