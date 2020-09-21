/* eslint-disable no-console */
/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  router = express.Router();

router.get("/", (req, res)=>{
    req.user.online = false;
    req.user.save();
    req.logout();
    return res.redirect("/login");
});

module.exports = router;