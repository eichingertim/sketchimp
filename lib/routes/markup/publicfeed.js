/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const Constants = require("../../config/Constants");

const express = require("express"),
  router = express.Router(),
  dbWrapper = require("../../database/DatabaseWrapper");

router.get("/", (req, res) => {
  try {
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
          return res.status(Constants.HTTP_STATUS_CODES.OK).render("publicfeed", {user: undefined, title: "publicfeed", sketches: published});
        }

        userPromise.then((rUser) => {
          return res.status(Constants.HTTP_STATUS_CODES.OK).render("publicfeed", {user: rUser, title: "publicfeed", sketches: published});
        });
      } else{
        return res.status(Constants.HTTP_STATUS_CODES.OK).render("publicfeed", {user: undefined, title: "publicfeed", sketches: published});
      }    
    })
    .catch((e) => {
      console.log(e);
      return res.status(Constants.HTTP_STATUS_CODES.NOT_FOUND).redirect("/");
    });
  } catch(e) {
    console.log(e);
    return res.render("serverError", { user: undefined, title: "Error" });
  }
});

module.exports = router;