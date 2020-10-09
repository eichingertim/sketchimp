/* eslint-disable no-useless-escape */
/* eslint-env node */

const express = require("express"),
    _ = require("lodash"),
    path = require("path"),
    router = express.Router(),
    StorageWorker = require("../../storage/StorageWorker"),
    dbWrapper = require("../../database/DatabaseWrapper"),
    Constants = require("../../config/Constants");

/**
 * Serves a form that allows users to see and change their data saved on the server
 */

router.get("/", (req, res)=>{
    try {
        let fetchPromise = dbWrapper.User.getPopulatedForId(req.user._id);
        if (!fetchPromise) {
            res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
        fetchPromise.then((rUser) => {
            return res.render("profile", { user: rUser , title: "profile", uploadField: Constants.UPLOAD.AVATAR.FORM_FIELD });
        })
        .catch(() => {
            return res.render("serverError", { user: undefined, title: "Error" });
        });
    } catch(e) {
        return res.render("serverError", { user: undefined, title: "Error" });
    }
});

/**
 * Accepts form data to update Users in the Database
 */

router.post("/update", (req, res)=>{
    try {
        let updatePromise = dbWrapper.User.updateForId(req.user._id, req.body.user);
        if (!updatePromise) {
            res.status(Constants.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
        }
        updatePromise.then(() => {
            return res.redirect("/@me");
        })
        .catch(() => {
            return res.render("serverError", { user: undefined, title: "Error" });
        });
    } catch(e) {
        return res.render("serverError", { user: undefined, title: "Error" });
    }
});

/**
 * Accepts image upload and stores the file on the local file system
 */

router.post("/upload", StorageWorker.uploadIcon.single(Constants.UPLOAD.AVATAR.FORM_FIELD), (req, res) => {
    let files,
    file = req.file.filename,
    matches = file.match(/^(.+?)_.+?\.(.+)$/i);
    if (matches) {
        files = _.map(["lg", "md", "sm"], (size) => {
            return matches[1] + "_" + size + "." + matches[2];
        });
    } else {
        files = [file];
    }
    files = _.map(files, (file) => {
        let url = path.join(file).replace(/^[\\\/]+/g, "/").replace(/^[\/]+/g, "");
        return Constants.UPLOAD.AVATAR.BASE_URL + "/" + url;
    });
    dbWrapper.User.setAvatar(req.user, files[0]);
    return res.redirect("/@me");
});

module.exports = router;