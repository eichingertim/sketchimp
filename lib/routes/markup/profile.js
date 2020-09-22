/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  UserRepository = require("../../repository/UserRepository"),
  router = express.Router();

router.get("/", (req, res)=>{
    let fetchPromise = UserRepository.getPopulatedForId(req.user._id);
    if (!fetchPromise) {
        res.status(500);
    }
    fetchPromise.then((rUser) => {
        return res.render("profile", { user: rUser });
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
  
module.exports = router;