/* eslint-env node */

const express = require("express"),
  router = express.Router();

/**
 * Serves the applications legal notice
 */

router.get("/", (req, res) => {
  let rUser;
  if (req.user) {
    rUser = req.user;
  }
  return res.render("imprint", { user: rUser, title: "imprint" });
});

module.exports = router;