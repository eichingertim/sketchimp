/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  UserRepository = require("../../repository/UserRepository"),
  Constants = require("../../config/Constants"),
  _ = require("lodash"),
  path = require("path"),
  StorageWorker = require("../../storage/StorageWorker"),
  router = express.Router();

router.get("/", (req, res)=>{
    let fetchPromise = UserRepository.getPopulatedForId(req.user._id);
    if (!fetchPromise) {
        res.status(500);
    }
    fetchPromise.then((rUser) => {
        return res.render("profile", { user: rUser , avatar_field: Constants.AVATAR_FIELD });
    })
    .catch((e) => {
        return res.send(e);
    });
});

router.post("/update", (req, res)=>{
    let updatePromise = UserRepository.updateForId(req.user._id, req.body.user);
    if (!updatePromise) {
        res.status(500);
    }
    updatePromise.then(() => {
        return res.redirect("/@me");
    })
    .catch((e) => {
        console.log(e);
        return res.redirect("/@me");
    });
});

router.post("/upload", StorageWorker.upload.single(Constants.AVATAR_FIELD), (req, res) => {
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
        let port = 8000,
            base = req.protocol + "://" + req.hostname + ":" + port,
            url = path.join(req.file.baseUrl, file).replace(/^[\\\/]+/g, "/").replace(/^[\/]+/g, "");
        return (req.file.storage === "local" ? base : "") + "/" + url;
    });
    UserRepository.setUserAvatar(req.user, files[0]);
    return res.redirect("/@me");
});

module.exports = router;