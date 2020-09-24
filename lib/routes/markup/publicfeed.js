/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  router = express.Router();

router.get("/", (req, res) => {
    return res.status(200).send("hello publicfeed");
    //return res.render("frontpage", { user: rUser });
});

module.exports = router;