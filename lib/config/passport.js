/* eslint-disable no-param-reassign */
/* eslint-env node */

const bcrypt = require("bcryptjs"),
    User = require("../models/user"),
    hashLength = 10,
    localSignupStrategy = (req, email, password, done)=>{
        if(email){
            email = email.toLowerCase();
        }
        process.nextTick(()=>{
            if(!req.user) {
                User.findOne({ email }, (err, user) => {
                    if(!err){
                        if(!user){
                        bcrypt.genSalt(hashLength, (errC, salt)=>{
                            bcrypt.hash(password, salt, (errCrypt, res)=>{
                                let channels = [],
                                    username = req.body.username;
                                const newUser = {
                                    username,
                                    email,
                                    password: res,
                                    channels,
                                };
                                    User.create(newUser, (rErr, rUser)=>{
                                    if(rErr){
                                        return done(rErr);
                                    }

                                    return done(null, rUser);
                                });
                            });
                        });
                    }
                    return done(null, false, { message: "User already registered" });
                }
                return done(err);
                });
            } else if(!req.user.email){
                User.findOne({ email }, (err, rUser) => {
                    if(!err){
                        if(!rUser){
                            bcrypt.genSalt(hashLength, (errC, salt)=>{
                                bcrypt.hash(password, salt, (errCrypt, res)=>{
                                    const newUser = req.user;
        
                                    newUser.email = email;
                                    newUser.password = res;
        
                                    User.create(newUser, (rErr, rUser2)=>{
                                        if(err){
                                            return done(err);
                                        }
        
                                        return done(null, rUser2);
                                    });
                                });
                            });
                        }
                        return done(null, false);
                    }
                    return done(err);
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
        process.nextTick(()=>{
            User.findOne({ email }, (err, user) =>{
                if(!err){
                    if(user){
                        bcrypt.compare(password, user.password, (errC, res)=>{
                            if(res){
                                return done(null, user);
                            }
                                return done(null, false);
                        });
                    }
                    return done(null, false);
                }
                return done(err);
            });
        });
    };

module.exports.localSignupStrategy = localSignupStrategy;
module.exports.localSiginStrategy = localSigninStrategy;
