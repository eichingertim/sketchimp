/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  User = require("../../models/user"),
  router = express.Router();

router.get("/", (req, res) => {
    let user;
    if (req.user) {
        User.findById(req.user._id).then((rUser) => {
            user = rUser;
        }) 
        .catch((e)=> {
          console.log(e);
        });
    }
    res.render("frontpage", { user: user, title: "Frontpage"});
});

module.exports = router;