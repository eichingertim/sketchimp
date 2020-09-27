/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  router = express.Router(),
  dbWrapper = require("../../database/DatabaseWrapper");

router.get("/", (req, res) => {
  try {
    let sketchPromise = dbWrapper.Sketch.getAllPublished();
    if(!sketchPromise){
      return;
    }
    sketchPromise.then((published) => {
      if(req.user){
        let userPromise = dbWrapper.User.getPopulatedForId(req.user._id);
        if(!userPromise){
          return res.status(200).render("publicfeed", {user: undefined, sketches: published});
        }
        
        userPromise.then((rUser) => {
          console.log(rUser);
          return res.status(200).render("publicfeed", {user: rUser, sketches: published});
        });
      }else{
        return res.status(200).render("publicfeed", {user: undefined, sketches: published});
      }    
    })
    .catch((e) => {
      console.log(e);
      return res.render("serverError", { user: undefined, title: "Error" });
    });
  } catch(e) {
    console.log(e);
    return res.render("serverError", { user: undefined, title: "Error" });
  }
});

module.exports = router;