/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const Constants = require("../../config/Constants");

const express = require("express"),
  router = express.Router(),
  dbWrapper = require("../../database/DatabaseWrapper");

router.get("/", (req, res) => {
  let sketchPromise;
  if(req.user){
   sketchPromise = dbWrapper.Sketch.getAllPublishedWithUserId(req.user._id);
  }else{
    sketchPromise = dbWrapper.Sketch.getAllPublished();
  }

  if(!sketchPromise){
    return res.status(Constants.HTTP_STATUS_CODES.NOT_FOUND).redirect("/");
  }

  sketchPromise.then((published) => {
    if(req.user){
      let userPromise = dbWrapper.User.getPopulatedForId(req.user._id);
      if(!userPromise){
        return res.status(Constants.HTTP_STATUS_CODES.OK).render("publicfeed", {user: undefined, sketches: published});
      }

      userPromise.then((rUser) => {
        return res.status(Constants.HTTP_STATUS_CODES.OK).render("publicfeed", {user: rUser, sketches: published});
      });
    }else{
      return res.status(Constants.HTTP_STATUS_CODES.OK).render("publicfeed", {user: undefined, sketches: published});
    }    
  })
  .catch((e) => {
    console.log(e);
    return res.status(Constants.HTTP_STATUS_CODES.NOT_FOUND).redirect("/");
  });
});

module.exports = router;