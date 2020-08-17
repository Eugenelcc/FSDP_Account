const alertMessage = require('./messenger'); //Bring in the alert message 

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {  //if user is authenticated 
        return next(); //Calling next() to proceed to the next statement
    }

    //if not authenticated, show alertmessage  and redirect to homepage ("/")
    alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
    res.redirect('/');
}   


module.exports = ensureAuthenticated;
