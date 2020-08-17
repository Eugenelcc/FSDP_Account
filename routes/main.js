const express = require('express');
const router = express.Router();
const alertMessage = require('../helpers/messenger');



router.get('/', (req, res) => {
  const title = 'Video Jotter';
  res.render('index', { title: title }) // renders views/index.handlebars
});


router.get("/profile", (req, res) => {
  const title = "Profile";
  res.render("user/user_profile", { title: title }); // renders views/index.handlebars
});

//about 
router.get('/about', (req, res) => {
 
 let success_msg = "Success message!";
 let error_msg = "Error message using error_msg";
 let error = "Error message using error_object";
 let errors = [
   { text: "First error message" },
   { text: "Second error message" },
   { text: "Third error message" },
 ];
	
	
  req.flash('info', 'Flash is back!')
  
  alertMessage(res, 'success', 'This is an important message', 'fas fa-sign-in-alt', true);
 

	res.render('about', { error:error,errors:errors, success_msg:success_msg,error_msg:error_msg,alertMessage:alertMessage});
})



//checkout
router.get("/checkout", (req, res) => {
  const title = "Video Jotter";
  res.render("products & checkout/checkout", { title: title }); // renders views/index.handlebars
});



//products 
router.get("/product", (req, res) => {
  const title = "Video Jotter";
  res.render("products & checkout/products", { title: title }); // renders views/index.handlebars
});

router.get("/product-details", (req, res) => {
  const title = "Video Jotter";
  res.render("products & checkout/product-details", { title: title }); // renders views/index.handlebars
});



//teams
router.get("/teams", (req, res) => {
  const title = "Video Jotter";
  res.render("misc/team", { title: title }); // renders views/index.handlebars
});



//testimonials
router.get("/testimonials", (req, res) => {
  const title = "Video Jotter";
  res.render("misc/testimonials", { title: title }); // renders views/index.handlebars
});

//FAQ
router.get("/FAQ", (req, res) => {
  const title = "Video Jotter";
  res.render("misc/faq", { title: title }); // renders views/index.handlebars
});


//Terms
router.get("/terms", (req, res) => {
  const title = "Video Jotter";
  res.render("misc/terms", { title: title }); // renders views/index.handlebars
});

//Contact us 
router.get("/contact", (req, res) => {
  const title = "Video Jotter";
  res.render("misc/contact", { title: title }); // renders views/index.handlebars
});


//Check for auth
router.get("/check", (req, res) => {

  res.send("You are logged in as this profile" + " " + req.user.name);

})




module.exports = router;
