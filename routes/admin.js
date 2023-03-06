const User = require("../models/User");
const alertMessage = require("../helpers/messenger");
const passport = require("passport");
const { Op } = require("sequelize");
const express = require("express");
const router = express.Router();
var bcrypt = require("bcryptjs");
const ensureAuthenticated = require("../helpers/auth");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { success } = require("flash-messenger/Alert");
const flash = require("connect-flash");


//Nodemailer		
			async function deletereason(id, email, reason, fname, lname) {
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
            rejectUnauthorized: false,
          },
        });

        let message = {
          from: "Eugene 👻<NoReply@Node.com>", // sender address
          to: email, // list of receivers
          subject: "Node Account Termination ✔", // Subject line
          text: "Node Account Termination ✔", // plain text body
          html: `Node Account Termination ✔.<br><br>
								Hello <strong>${fname} ${lname}</strong> <br><br>
								Your account had been monitored and terminated by the Admins due to breaking account policy <br><br> 
                                The reason for this termination action : <br><br>
                                <strong>${reason} </strong> <br><br>
                <img src="https://cdn.discordapp.com/attachments/232027005237854209/718432381664624690/cda.png"/>`,
        };
        let info = await transporter.sendMail(message);
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }

// Logout User
router.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');

});

//Manage user
router.get('/manageusers', ensureAuthenticated, (req,res) => {
	User.findAll({
		where: {
			id:{[Op.ne]: req.user.id}
		}
        
    })

    .then((users) => {
        
        //pass object to listVideos.handlebar
        res.render("user/manageusers", {
          users: users,
        });
    })
    .catch(err => console.log(err));

	});



// manage {delete user }
router.post("/delete_user", (req, res) => {

    let { fname, lname, email, id, role, verified, reason } = req.body;

    console.log(fname)
    User.destroy({
        where: {
            id: id,
        },
    })
        .then(() => {
            console.log("ID:", id, "email:", email, "reason:", reason, "fname:", fname, "lname:", lname);
            deletereason(id, email, reason, fname, lname);
            res.redirect("/adminRoute/manageusers");
        })
        .catch((err) => console.log(err));
});


// manage {update user }
router.post("/update_user", (req, res) => {
  let { fname,lname, email, password, id, phone,location,role,verified } = req.body;
  const hash = bcrypt.hashSync(password);
  
  User.update(
    {
	  fname,
	  lname,
      email,
      password,
      role,
      verified,
      phone,
      location
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then(() => {
      res.redirect("/adminRoute/manageusers");
      console.log("ACTUAL PASS :",password);
    })
    .catch((err) => console.log(err));
});


module.exports = router;