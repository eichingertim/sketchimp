/* eslint-env node */
/* eslint-disable no-underscore-dangle */

const express = require("express"),
  router = express.Router(),
  dbWrapper = require("../../database/DatabaseWrapper");

router.get("/", (req, res) => {
    let sketchPromise = dbWrapper.Sketch.getAllPublished();
    if(!sketchPromise){
      return;
    }

    sketchPromise.then((published) => {
      if(req.user){
        let userPromise = dbWrapper.User.getPopulatedForId(req.user._id);
        if(!userPromise){
          return res.status(200).render("publicfeed", {user: undefined, title: "publicfeed", sketches: published});
        }

        userPromise.then((rUser) => {
          console.log(rUser);
          return res.status(200).render("publicfeed", {user: rUser, title: "publicfeed", sketches: published});
        });
      }else{
        return res.status(200).render("publicfeed", {user: undefined, title: "publicfeed", sketches: published});
      }    
    })
    .catch((e) => {
      console.log(e);
      return res.status(404).redirect("/");
    });
    
});

module.exports = router;