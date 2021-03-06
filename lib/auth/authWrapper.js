/* eslint-env node */

const express = require("express"),
    session = require("express-session"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportStrategy = require("./passport"),
    Constants = require("../config/Constants"),
    bodyParser = require("body-parser"),
    User = require("../database/models/user");

/**
 * Sets up the session using bodyParser and a secret
 */

function setupSession(router) {
    router.use(bodyParser.urlencoded({limit: "100mb", extended : true}));
    router.use(bodyParser.json({limit: "100mb"}));
    router.use(session({
      secret: Constants.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
    }));
}

/**
 * Configures Passport to use the local strategies
 */

function setupPassport(router) {
    router.use(passport.initialize());
    router.use(passport.session());
    passport.use("local-login", new LocalStrategy({
        usernameField: Constants.PASSPORT_SETTINGS.USERNAME_FIELD,
        passwordField: Constants.PASSPORT_SETTINGS.PASSWORD_FIELD,
        passReqToCallback: true,
    }, passportStrategy.localSigninStrategy));
    passport.use("local-signup", new LocalStrategy({
        usernameField: Constants.PASSPORT_SETTINGS.USERNAME_FIELD,
        passwordField: Constants.PASSPORT_SETTINGS.PASSWORD_FIELD,
        passReqToCallback: true,
    }, passportStrategy.localSignupStrategy));
    passport.serializeUser((user, done)=>{
        done(null, user.id);
    });
    passport.deserializeUser((id, done)=>{
        User.findById(id, (err, user)=>{
            done(err, user);
        });
    });
}

/**
 * Provides a Class that bundles Authentication and Session Setup
 */

class AuthWrapper {
    constructor() {
        this.router = express.Router();
        setupSession(this.router);
        setupPassport(this.router);
    }
}

module.exports = new AuthWrapper();