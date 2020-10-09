/* eslint-env node */

const Constants = require("../../config/Constants");

const express = require("express"),
  router = express.Router(),
  dbWrapper = require("../../database/DatabaseWrapper");

router.get("/", (req, res) => {
  try {
    let sketchPromise;
    // if there is an user logged in, get his votes in addition to the sketch data
    if(req.user){
     sketchPromise = dbWrapper.Sketch.getAllPublishedWithUserId(req.user._id);
    }else{
      sketchPromise = dbWrapper.Sketch.getAllPublished();
    }

    // return to landing if something went wrong
    if(!sketchPromise){
      return res.status(Constants.HTTP_STATUS_CODES.NOT_FOUND).redirect("/");
    }

    sketchPromise.then((published) => {
      if(req.user){
        let userPromise = dbWrapper.User.getPopulatedForId(req.user._id);
        if(!userPromise){
          // return sketches without user
          return res.status(Constants.HTTP_STATUS_CODES.OK).render("publicfeed", {user: undefined, title: "publicfeed", sketches: published});
        }

        userPromise.then((rUser) => {
          // return sketches with user
          return res.status(Constants.HTTP_STATUS_CODES.OK).render("publicfeed", {user: rUser, title: "publicfeed", sketches: published});
        });
      } else{
        // return sketches without user
        return res.status(Constants.HTTP_STATUS_CODES.OK).render("publicfeed", {user: undefined, title: "publicfeed", sketches: published});
      }    
    })
    .catch(() => {
      // return to landing if something went wrong
      return res.status(Constants.HTTP_STATUS_CODES.NOT_FOUND).redirect("/");
    });
  } catch(e) {
    // render serverError if something unexpected happened
    return res.render("serverError", { user: undefined, title: "Error" });
  }
});

module.exports = router;