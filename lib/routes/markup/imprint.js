/* eslint-env node */

const express = require("express"),
  router = express.Router();

router.get("/", (req, res) => {
  let rUser;
  if (req.user) {
    rUser = req.user;
  }
  return res.render("imprint", { user: rUser, title: "imprint" });
});

module.exports = router;