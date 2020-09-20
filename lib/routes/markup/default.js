/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  router = express.Router();

router.get("/", (req, res) => {
  return res.render("landing", { title: "Landing" });
});

router.get("/*", (req, res) => {
  return res.send("Could not find what you were looking for! :(");
});

module.exports = router;