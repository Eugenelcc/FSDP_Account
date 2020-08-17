const express = require('express');
const router = express.Router();
const moment = require('moment');
const Video = require('../models/Video');
const alertMessage = require('../helpers/messenger'); //Bring in alert messenger
// List videos belonging to current logged in user
const ensureAuthenticated = require('../helpers/auth');
const fs = require('fs');
const upload = require('../helpers/imageUpload');
const User = require('../models/User');



//list video
router.get('/listvideos', ensureAuthenticated, (req, res) => {
    Video.findAll({
        where: {
            userId: req.user.id
        },
        order: [
            ['title', 'ASC']
        ],
        raw: true
    })
        .then((videos) => {
            console.log(videos);
            console.log(req.user);
            //pass object to listVideos.handlebar
            res.render('video/listVideos', {
                fname: req.user.fname,
                lname: req.user.lname,
                email: req.user.email,
                location: req.user.location,
                role: req.user.role,

                

                videos: videos
            });
        })
        .catch(err => console.log(err));

});
//delete video
router.get('/delete/:id', ensureAuthenticated, (req, res) => {

    let videoId = req.params.id;
    let userId = req.user.id;
    Video.findOne({
        where: {
            id: videoId,
            userId: req.user.id
        },
    }).then((video) => {
        if (req.user.id != video.userId) {
            alertMessage(res, 'err', 'Access Denied', 'fas fa-exclamation-circle', true);
            res.redirect('/');
        }
        else {

            Video.destroy({
                where: {
                    id: videoId
                }
            }).then((video) => {
                alertMessage(res, 'success', "Video deleted", 'fas fa-trash-alt', true);
                res.redirect('/video/listVideos');

            })
        }
    })

        .catch(err => {
            console.log(err)
            alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
            alertMessage(res, 'noti', 'Bye-bye!', 'fas fa-power-off', true);
            res.redirect('/logout');

        }



        );


});



// Save edited video
router.put('/saveEditedVideo/:id', (req, res) => {
    // Retrieves edited values from req.body

    let title = req.body.title;
    let story = req.body.story.slice(0, 1999);
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    let language = req.body.language.toString();
    let subtitles = req.body.subtitles === undefined ? '' : req.body.subtitles.toString();
    let classification = req.body.classification;
    let userId = req.user.id;
    let posterURL = req.body.posterURL;
    let starring = req.body.starring;

    Video.update({
        // Set variables here to save to the videos table
        title,
        story,
        classification,
        language,
        subtitles,
        dateRelease,
        starring,
        posterURL
    },
        {
            where: {
                id: req.params.id
            }
        }).then(() => {
            // After saving, redirect to router.get(/listVideos...) to retrieve all updated
            // videos
            res.redirect('/video/listVideos');
        }).catch(err => console.log(err));
});
//Shows edit video page
router.get('/edit/:id', ensureAuthenticated, (req, res) => {

    Video.findOne({
        where: {
            id: req.params.id
        }
    }).then((video) => {
        checkOptions(video);
        //call views/video/editVideo.handlebar to redner the edit video page
        if (req.user.id == video.userId) {
            res.render('video/editVideo', {
                video: video   //passes video object to handlebar
            });
        }
        else {
            alertMessage(res, 'danger', 'Access Denied', 'fas fa-excalamation-circle', true);
            res.redirect('/');
        }
    }).catch(err => console.log(err)); //To catch no video ID
});

//Creates variables with 'check' to put a tick in the appropriate checkbox

function checkOptions(video) {
    video.chineselang = (video.language.search('Chinese') >= 0) ? 'checked' : '';
    video.englishlang = (video.language.search('English') >= 0) ? 'checked' : '';
    video.malaylang = (video.language.search('Malay') >= 0) ? 'checked' : '';
    video.tamillang = (video.language.search('Tamil') >= 0) ? 'checked' : '';


    video.chineseSub = (video.subtitles.search('Chinese') >= 0) ? 'checked' : '';
    video.englishSub = (video.subtitles.search('English') >= 0) ? 'checked' : '';
    video.malaySub = (video.subtitles.search('Malay') >= 0) ? 'checked' : '';
    video.tamilSub = (video.subtitles.search('Tamil') >= 0) ? 'checked' : '';



}



//Add video
router.post('/addVideo', (req, res) => {
    let title = req.body.title;
    let story = req.body.story.slice(0, 1999);
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    let language = req.body.language.toString();
    let subtitles = req.body.subtitles === undefined ? '' : req.body.subtitles.toString();
    let classification = req.body.classification;
    let userId = req.user.id;
    let posterURL = req.body.posterURL;
    let starring = req.body.starring;

    // Multi-value components return array of strings or undefined
    Video.create({
        title,
        story,
        classification,
        language,
        subtitles,
        dateRelease,
        starring,
        posterURL,
        userId
    })
        .then(video => {
            res.redirect('/video/listVideos');
        })
        .catch(err => console.log(err))
});



router.get('/addvideo', ensureAuthenticated, (req, res) => {

    res.render('video/addVideo')


});

// Upload poster
router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)){
    fs.mkdirSync('./public/uploads/' + req.user.id);
    }
    upload(req, res, (err) => {
    if (err) {
    res.json({file: '/img/no-image.jpg', err: err});
    } else {
    if (req.file === undefined) {
    res.json({file: '/img/no-image.jpg', err: err});
    } else {
    res.json({file: `/uploads/${req.user.id}/${req.file.filename}`});
    }
    }
    });
    })

module.exports = router;