const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;;
const keys = require('./Auth_keys.js')
const passport = require("passport");
const alertMessage = require("../helpers/messenger");
// Load user model
const User = require('../models/User');



function localStrategy(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password,
        done) => {
        User.findOne({ where: { email: email } })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'No User Found with this: ' +  email    });
                }
                //Email Not verified 
                 if (user.verified == false) {
                   console.log("ACCOUNT IS NOT VERIFIED"); //ACCOUNT NOT VERIFIED
                            return done(null, false, { message: email +'is not verified' });
                 }
                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            message: 'Password incorrect'});
}
})
            })
    }));
    // Serializes (stores) user id into session upon successful
    // authentication
    passport.serializeUser((user, done) => {
        done(null, user.id); // user.id is used to identify authenticated user
    });
    // User object is retrieved by userId from session and
    // put into req.user
    passport.deserializeUser((userId, done) => {
        User.findByPk(userId)
            .then((user) => {
                done(null, user); // user object saved in req.session
            })
            .catch((done) => { // No user found, not stored in req.session
                console.log(done);
            });
    });
}

//OAuth (Google)
function MultiStrategy(passport) {
    passport.use(
        new GoogleStrategy(
            {
                callbackURL: "/auth/google/callback", //callback
                clientID: keys.google.clientID,
                clientSecret: keys.google.clientSecret,
            },
            function (accessToken, refreshToken, profile, done) {
                //profile.id 
                //profile.name
                console.log(profile);
                User.findOne({ where: { email: profile.emails[0].value} })
                    .then(user => {
                        if (!user) {
                            User.create({ fname: profile.name.givenName, lname: profile.name.familyName, email: profile.emails[0].value, password: null, googleId: profile.id, role: "user", verified:1 })
                                .then(user => {
                                    console.log("######################")
                                    console.log("Creating User: ");
                                    console.log(user.id);
                                    console.log(user.fname);
                                    console.log(user.lname);
                                    console.log(user.email);
                                    console.log(user.googleId);
                                    console.log("######################")
                                    return done(null, user);
                                })
                                .catch(err => console.log(err));
                        }
                        else {
                            console.log("Google User found : ");
                            console.log(user.id, user.fname);
                            if (!user.googleId) {
                                user.update({
                                    googleId: profile.id
                                })
                            }
                            return done(null, user);
                        }
                    }).catch(err => console.log(err));
            }));



    //FACEBOOK 
    passport.use(
        new FacebookStrategy(
            {
                callbackURL: "/auth/facebook/callback", //callback
                clientID: keys.facebook.clientID,
                clientSecret: keys.facebook.clientSecret,
                profileFields: ['id', 'emails', 'name']
            },
            function (accessToken, refreshToken, profile, done) {
                //profile.id
                //profile.name
                console.log(profile);
                User.findOne({ where: { email: profile.emails[0].value } })
                    .then((user) => {
                        if (!user) {
                            User.create({
                                fname: profile.name.givenName,
                                lname: profile.name.familyName,
                                email: profile.emails[0].value,
                                password: null,
                                facebookId: profile.id,
                                role: "user",
                                verified:1,
                            })
                                .then((user) => {
                                    console.log("######################");
                                    console.log("Creating User: ");
                                    console.log(user.id);
                                    console.log(user.fname);
                                    console.log(user.lname);
                                    console.log(user.email);
                                    console.log(user.facebookId);
                                    console.log(accessToken)
                                    console.log("######################");

                                    return done(null, user);
                                })
                                .catch((err) => console.log(err));
                        } else {
                            console.log("Facebook User found : ");
                            console.log(user.id, user.fname);
                            if (!user.facebookId) {
                                user.update({
                                    facebookId: profile.id,
                                });
                            }
                            return done(null, user);
                        }
                    })
                    .catch((err) => console.log(err));
            }
        )
    );






    passport.serializeUser((user, done) => {
        done(null, user.id);
    })

    passport.deserializeUser((userId, done) => {
        User.findOne({ where: { [Op.or]: [{ id: userId }, { googleId: userId }] } })
            .then((user) => {
                done(null, user); // user object saved in req.session
            })
            .catch((done) => { // No user found, not stored in req.session
                console.log(done);
            });
    });
}
module.exports = { localStrategy, MultiStrategy };
