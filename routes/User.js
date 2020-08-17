const User = require('../models/User');
const alertMessage = require('../helpers/messenger');
const passport = require('passport');
const { Op } = require("sequelize"); 	
const express = require("express");
const router = express.Router();
var bcrypt = require('bcryptjs');
const ensureAuthenticated = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { success } = require('flash-messenger/Alert');
const flash = require("connect-flash");
const e = require('express');
//register
router.get('/register', (req, res) => {
	res.render('user/register');
})

router.post("/register", async (req, res) => {
  let errors = [];

	// Retrieves fields from register page from request body
    let { fname, lname, email, password, password2, role,} = req.body;
    let { address , location } = ""
	let prof_image = '/img/guest-user.png'
	
	// Checks if both passwords entered are the same
	if (password !== password2) {
		errors.push({ text: 'Passwords do not match' });
	}
	// Checks that password length is more than 4
	if (password.length < 4) {
		errors.push({ text: 'Password must be at least 4 characters' });
	}
	if (errors.length > 0) {
		res.render('user/register', {
			errors,
			fname,
			lname,
			email,
			password,
			password2,
			role,
			prof_image,
	
			address,
			location,
		});
	} else {
		// If all is well, checks if user is already registered
		User.findOne({ where: { email: req.body.email } })
			.then(user => {
				if (user) {
				
					res.render('user/register', {
						error: user.email + ' already registered',
					
						fname,
						lname,
						email,
						password,
						password2,
						role,
						prof_image,
			
						address,
						location,
						verified:1,
					});
                } else
                {
                 // Create new user record
				//================================================
				// Generate JWT token
				let token;
				jwt.sign(email, "s3cr3Tk3y", (err, jwtoken) => {
				if (err) console.log("Error generating Token: " + err);
                    token = jwtoken;
                    console.log('token test:',token)
                });
             
//==================================================================================
			//Nodemailer		
			async function sendEmail(userId, email, token) {
            let transporter = nodemailer.createTransport({
              //host: "smtp.ethereal.email",
              //port: 587,
              service: "gmail",
              secure: false, // true for 465, false for other ports
              auth: {
                //user: "moshe.schulist55@ethereal.email", // generated ethereal user
                //pass: "vtrA8A7Mjbkb9nfxzA", // generated ethereal password
                //=============================================================
                  user: process.env.EMAIL, // Gmail user
                  pass: process.env.PASSWORD, // Gmail Password
              },
              tls: {
                rejectUnauthorized: false
              }
            });

            let message = {
              from: 'Eugene 👻<NoReply@Node.com>', // sender address
              to: email, // list of receivers
              subject: "Node Email Verification ✔", // Subject line
              text: "Node Email Verification", // plain text body
               html: `Thank you registering with Node.<br><br>
								Hello <strong> ${fname} ${lname} <br><br></strong>
								Please<a href = "http://localhost:5000/user/verify/${userId}/${token}">
								<strong>verify</strong></a>your account.<br><br>
                <img src="https://cdn.discordapp.com/attachments/232027005237854209/718432381664624690/cda.png"/>`,
            };
				let info = await transporter.sendMail(message);
				console.log("Message sent: %s", info.messageId);
				console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
          }
//=============================================================================================
				//bcrypt
                 bcrypt.genSalt(10, function (err, salt) {
                   if (err) return next(err);
                   bcrypt.hash(password, salt, function (err, hash) {
                     if (err) return next(err);

                       password = hash;
                       //=============================================
                     User.create({
                       fname,
                       lname,
                       email,
                       password,
                       role,
                       prof_image,
                    
                       address,
                       verified: 0,
                     })

						 .then((user) => {
							 sendEmail(user.id, user.email, token);
                             console.log("TOKEN", token) 
                             
                         alertMessage(
                           res,
                           "success",
                           user.fname + " added.Please login",
                           "fas fa - sign -in -alt",
                           true
                         );
                         res.redirect("/user/login");
                       })
                       .catch((err) => console.log(err));
                   });
                 });
               }
			});
	}
});
//===========================================================================================

//JWT GET
router.get("/verify/:userId/:token", (req, res, next) => {
  // retrieve from user using id
  User.findOne({
    where: {
      id: req.params.userId,
    },
  }).then((user) => {
    if (user) {
      // If user is found
      let userEmail = user.email; // Store email in temporary variable
      if (user.verified == true) {
        // Checks if user has been verified
        alertMessage(
          res,
          "info",
          "User already verified",
          "fas faexclamation-circle",
          true
        );
        res.redirect("/user/login");
      } else {
        // Verify JWT token sent via URL
        jwt.verify(req.params.token, "s3cr3Tk3y", (err, authData) => {
          if (err) {
            alertMessage(
              res,
              "danger",
              "Unauthorised Access",
              "fas faexclamation-circle",
              true
            );
            res.redirect("/login");
          } else {
            User.update(
              { verified: 1 },
              {
                where: { id: user.id },
              }
            ).then((user) => {
              alertMessage(
                res,
                "success",
                userEmail + " verified.Please login",
                "fas fa-sign-in-alt",
                true
              );
              res.redirect("/user/login");
            });
          }
        });
      }
    } else {
      alertMessage(
        res,
        "danger",
        "Unauthorised Access",
        "fas fa-exclamationcircle",
        true
      );
      res.redirect("/");
    }
  });
});
//==============================================================================================


//login
router.get('/login', (req, res) => {
	res.render('user/login');
})


router.post('/login', (req, res) => {
				passport.authenticate("local", {
					successRedirect: "/video/listVideos", // Route to /video/listVideos URL
					failureRedirect: "/user/login", // Route to /login URL
					failureFlash: true,
				})(req, res);
			}
		
		
);
	

// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');

});


//profile
router.get('/profile', ensureAuthenticated, (req, res) => {
	User.findAll({
		where: {
			id: req.user.id,
		}

	})

		.then((users) => {

			//pass object to listVideos.handlebar
			res.render('user/profile', {

				users: users
			});
		})
		.catch(err => console.log(err));

});

// Profile {update user }
router.post("/update_profile", (req, res) => {
	let { fname, lname, email, phone, location, address } = req.body;
		User.update(
			{
				fname,
				lname,
				email,
				location,
				address,
			},
			{
				where: {
					id: req.user.id,
				},
			}
		)
			.then(() => {
				res.redirect("/user/profile");
			})
			.catch((err) => console.log(err));
	}
);

// Profile {delete profile }
router.post("/delete_profile", (req, res) => {
	req.logout();
	let id = req.body.id;
	User.destroy({
		where: {
			id: req.user.id,
		},
    })
        .then(() => {
            
            res.redirect("/");
        })
        .catch((err) => console.log(err));
});





//Forget Password
router.get('/forgetpwd', (req, res) => {
    res.render('user/forgetpwd');
})

//Forget Password { POST }
router.post('/forgetpwd', (req, res) => {

    let email = req.body.email
    console.log(email)
    User.findOne({
        where: {
            email: email,
        }
    })
        .then((user) => {
            
         
            if (!user) {
                return res.status(400).json({ error: "USER with this email does not exists." })
            }
            else if (user.verified == false) {
                console.log("ACCOUNT IS NOT VERIFIED {Forget Pwd} "); //ACCOUNT NOT VERIFIED
                return res.status(400).json({ error: email + 'is not verified' });
            }
            else if (user.verified == true) {
                // Generate JWT token
                
                //=====================================================================================================
                //Nodemailer		
                async function sendEmail(userId, email, token, fname, lname) {
                    let transporter = nodemailer.createTransport({
                        //host: "smtp.ethereal.email",
                        //port: 587,
                        service: "gmail",
                        secure: false, // true for 465, false for other ports
                        auth: {
                            //user: "moshe.schulist55@ethereal.email", // generated ethereal user
                            //pass: "vtrA8A7Mjbkb9nfxzA", // generated ethereal password
                            //=============================================================
                            user: process.env.EMAIL, // Gmail user
                            pass: process.env.PASSWORD, // Gmail Password
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    let message = {
                        from: 'Eugene <Admin>  👻<NoReply@Node.com>', // sender address
                        to: email, // list of receivers
                        subject: "Change Password Verification ✔", // Subject line
                        text: "Change Password  Verification", // plain text body
                        html: `Change of password .<br><br>
								Hello  <strong> ${fname} ${lname} </strong> <br><br>
								Please<a href = "http://localhost:5000/user/resetpassword/${userId}/${token}">
								<strong>verify</strong></a> the password verification <br><br>
                                If you are not the person who request to change a password please contact us through the customer support
                <img src="https://cdn.discordapp.com/attachments/232027005237854209/718432381664624690/cda.png"/>`,
                    };
                    let info = await transporter.sendMail(message);
                    console.log("Message sent: %s", info.messageId);
                    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                    
                    
                }
                //#########################################################
                let token = jwt.sign(email, 'SECRETKEY')
                let fname = user.fname
                let lname = user.lname
                let userId = user.id
                
                sendEmail(userId, email, token, fname, lname)
                console.log(userId, email, token, fname, lname)
                
                alertMessage(
                    res,
                    "success",
                    "Email : " + email + " has been sent to your inbox email please check and verify it ",
                    "fas fa - sign -in -alt",
                    true
                );
                res.redirect("/user/login");
                User.update(
                    {
                        resetlink: token,
                    },
                    {
                        where: {
                            id: userId,
                        },
                    }
                )
               
               //=============================================================================================
           

    
          
            }
        })
});

 

router.post('/resetpassword/:userId/:token', (req, res) => {
    let errors = []
    let { password1, password2 } = req.body;
   
    
    // Checks if both passwords entered are the same
    if (password1 !== password2) {
        ealertMessage(
            res,
            "danger",
            "Password is not match",
            "fas fa-exclamationcircle",
            true
        );
    }
    // Checks that password length is more than 4
    if (password1.length < 4) {
        alertMessage(
            res,
            "danger",
            "Password is less than 4 digits ",
            "fas fa-exclamationcircle",
            true
        );
    }
    if (errors.length > 0) {
        res.render('user/changepwd')
    }
    else {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);
            bcrypt.hash(password1, salt, function (err, hash) {
                if (err) return next(err);
                password = hash;
            User.update(
                    { password: password },
                    {
                        where: { id: req.params.userId },
                    }
                ).then((user) => {
                    alertMessage(
                        res,
                        "success",
                        "Email : "+ user.email + " Password Changed Please login to your name credentials   ",
                        "fas fa-sign-in-alt",
                        true
                    );
                    res.redirect("/user/login");
                });
               
            })
        })   
    }



});

 









//JWT GET {{FORGET PWD + CHANGE PWD}}
router.get("/resetpassword/:userId/:token", (req, res, next) => {
    // retrieve from user using id
    User.findOne({
        where: {
            id: req.params.userId,
        },
    }).then((user) => {
        if (user) {
            // If user is found
            let userEmail = user.email; // Store email in temporary variable
             if (user.verified == true) {
                // Verify JWT token sent via URL
                 jwt.verify(req.params.token, "SECRETKEY", (err, authData) => {
                    if (err) {
                        alertMessage(
                            res,
                            "danger",
                            "Unauthorised Access",
                            "fas faexclamation-circle",
                            true
                        );
                        res.redirect("/");
                    } else {
                        User.update(
                            { verified: 1 },
                            {
                                where: { id: user.id },
                            }
                        ).then((user) => {
                            alertMessage(
                                res,
                                "success",
                               "Email: "+ userEmail + " Token have been verified and redirect to change ",
                                "fas fa-sign-in-alt",
                                true
                            );
                            
                            res.render('user/changepwd');
                        });
                    }
                });
            }
        } else {
            alertMessage(
                res,
                "danger",
                "Unauthorised Access",
                "fas fa-exclamationcircle",
                true
            );
            res.redirect("/");
        }
    });
});
//==============================================================================================


module.exports = router;