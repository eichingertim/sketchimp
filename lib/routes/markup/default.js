/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  router = express.Router();

router.get("/", (req, res) => {
  let rUser;
  if (req.user) {
    rUser = req.user;
  }
  return res.render("landing", { user: rUser });
});

router.get("/*", (req, res) => {
  return res.send("Could not find what you were looking for! :(");
});

module.exports = router;