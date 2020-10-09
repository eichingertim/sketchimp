/* eslint-env node */

const express = require("express"),
    session = require("express-session"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportStrategy = require("./passport"),
    Constants = require("../config/Constants"),
    bodyParser = require("body-parser"),
    User = require("../database/models/user");

function setupSession(router) {
    router.use(bodyParser.urlencoded({extended : true}));
    router.use(bodyParser.json());
    router.use(session({
      secret: Constants.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
    }));
}

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

class AuthWrapper {
    constructor() {
        this.router = express.Router();
        setupSession(this.router);
        setupPassport(this.router);
    }
}

module.exports = new AuthWrapper();