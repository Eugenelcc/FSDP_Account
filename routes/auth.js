const express = require("express");
const router = express.Router();

const passport = require('passport');


const alertMessage = require('../helpers/messenger');
var bcrypt = require('bcryptjs');

const User = require("../models/User");
//User model

//Auth with google
router.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/plus.login']
}));

//callback route for google redirect to 
router.get('/google/callback', passport.authenticate('google',
    {
        failureRedirect: '/user/login',
    }),
    function (req, res) {
        // success redirect 
        res.redirect("/video/listVideos");
        //res.send(req.user.name);
    });



//Facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] }));

router.get("/facebook/callback",passport.authenticate("facebook", {
    failureRedirect: "/user/login",
  }),
  function(req, res) {
        // success redirect 
      res.redirect("/video/listVideos")
    });










// Logout Auth 
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});
module.exports = router;