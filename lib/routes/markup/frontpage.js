/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  router = express.Router();

router.get("/", (req, res) => {
    let rUser;
    if (req.user) {
      rUser = req.user;
    }
    return res.render("frontpage", { user: rUser });
});

module.exports = router;