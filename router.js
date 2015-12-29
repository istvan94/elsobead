var express = require('express');
var router = new express.Router;
var passport = require('passport');

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {return next(); }
    req.flash('info', 'You need to log-in to access this content!');
    res.redirect('/auth/login');
}

router.route('/auth/login')
    .get(function(req, res) {
        res.render('auth/login', {
            title: "MisheQ's App",
            uzenetek: req.flash()
        });
    })
    .post(passport.authenticate('local-login', {
        successRedirect: '/list',
        failureRedirect: '/auth/login',
        failureFlash:   true,
        badRequestMessage: 'Invalid neptun or password'
    }));

router.route('/auth/signup')
    .get(function(req, res) {
        res.render('auth/signup', {
            title: "MisheQ's App",
            uzenetek: req.flash()
        });
    })
    .post(passport.authenticate('local-signup', {
        successRedirect: '/auth/login', 
        failureRedirect: '/auth/signup',
        failureFlash:   true,
        badRequestMessage:  'Itt apears that you have not filled out every line properly!'
    }));
    
router.use('/auth/logout', function(req,res) {
    req.logout();
    res.redirect('/auth/login');
});

router.get('/', function (req, res) {
    res.render('info', {
       title: "MisheQ's App"
    });
});

router.route('/list')
    .get(ensureAuthenticated, function (req, res) {
        var result;
        if(req.query.query) {
            var searchedSubject = req.query.query; // itt nemtudom mit kell beirni
            result = req.app.Models.subject.find({
                targy: searchedSubject,
                user: req.user.id
            });
        } else {
            result = req.app.Models.subject.find({
                user: req.user.id
            });
        }
        result
            .then(function(data) {
                res.render('list', {        //sima list vagy /list
                    title: "MisheQ's App",
                    data: data,
                    query: req.query.query,
                    uzenetek: req.flash()
                });
        
            })
            .catch(function() {
                console.log('Hiba!!!');
                throw 'error';
            });
    });
    
router.route('/list/:id')
    .get(ensureAuthenticated, function (req, res) {
        req.app.Models.subject.find({ id: req.params.id })
        .then(function(data) {
            res.render('list', {
                title: "MisheQ's App",
                data: data,
                uzenetek: req.flash()
            });
        })
        .catch(function() {
            console.log('Hiba!!!');
            throw 'error'; 
        });
    });
    
router.route('/add')
    .get(ensureAuthenticated, function (req, res) {
        res.render('add', {
            title: "MisheQ's App",
            uzenetek: req.flash()
        });
    })
    .post(ensureAuthenticated, function (req, res) {
        req.checkBody('targy', 'Hiba a targyal').notEmpty();
        req.checkBody('terem','Hiba a teremmel').notEmpty();
        
        if(req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
                req.flash('error', error.msg);
            });
            res.redirect('/add');
        } else {
            req.app.Models.subject.create({
                targy: req.body.targy,
                kredit: req.body.kredit,
                terem: req.body.terem,
                user: req.user.id
            })
            .then(function() {
                req.flash('success', 'Subject added!');
                res.redirect('/add');
            })
            .catch(function() {
                req.flash('error', 'Subject got not added!');
                res.redirect('/add');
            });
        }
    
    });

router.route('/modify/:id')
    .get(ensureAuthenticated, function(req, res) {
        req.app.Models.subject.findOne({
            id: req.params.id
        })
        .then(function (subject) {
            res.render('modify', {
                subject: subject,
                title: "MisheQ's App",
                uzenetek: req.flash()
            });
        });
    })
    .post(function(req, res) {     //ensureAuthenticated, ....
        req.checkBody('targy').notEmpty().withMessage('Missing subject name!');
        req.checkBody('kredit').isInt().withMessage('Credit has to be integer');
        req.checkBody('terem').notEmpty().withMessage('Missing classroom!');
        
        if(req.validationErrors()) {
            req.validationErrors().forEach(function (error) {
                req.flash('error', error.msg);
            });
            res.redirect('/modify');
        } else {
            req.app.Models.subject.update({
                id: req.params.id },
                req.body
                
            ).then(function (subject) {
                req.flash('success', 'Subject successfuly modified!');
                res.redirect('/list');
            })
            .catch(function () {
                req.flash('error', 'Subject modification failed!');
                res.redirect('/modify/:id');
            });
        }
        
    });
    
router.use('/delete/:id', ensureAuthenticated, function(req, res) {
    req.app.Models.subject.destroy({ id: req.params.id })
        .then(function() {
            req.flash('success', 'Subject deleted successfully!');
            res.redirect('/list');
        })
       .catch(function() {
            req.flash('error', 'Subject was not deleted!');
            res.redirect('/list');
        });
       
});



module.exports = router;