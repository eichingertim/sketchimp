/* eslint-env node */

const express = require("express"),
  router = express.Router();

/**
 * Renders the applications landing page 
 */

router.get("/", (req, res) => {
  let rUser;
  if (req.user) {
    rUser = req.user;
  }
  return res.render("landing", { user: rUser, title: "landing" });
});

/**
 * Wildcard-Route to serve users a 404 page when the accessed Route is invalid
 */

router.get("/*", (req, res) => {
  let rUser;
  if (req.user) {
    rUser = req.user;
  }
  return res.render("pageNotFound", { user: rUser, title: "pageNotFound" });
});

module.exports = router;