// Add Passport-related auth routes here.
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var twilio = require('twilio')(process.env.ACCOUNT_SID, process.env.ACCOUNT_TOKEN);

function randomCode() {
  var min = 1000;
  var max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = function(passport) {

  // GET registration page
  router.get('/signup', function(req, res) {
    res.render('signup');
  });

  // POST registration page
  var validateReq = function(userData) {
    return (userData.password === userData.passwordRepeat);
  };

  router.post('/signup', function(req, res) {
    // validation step
    if (!validateReq(req.body)) {
      return res.render('signup', {
        error: "Passwords don't match."
      });
    }
    var u = new User({
      username: req.body.username,
      password: req.body.password,
      verification: randomCode()
    });
    u.save(function(err, user) {
      if (err) {
        console.log(err);
        res.status(500).redirect('/signup');
        return;
      } else {
        twilio.messages.create({
            to: user.username,
            from: process.env.FROMPHONE,
            body: user.verification
          }, function(err1, responseData) { //this function is executed when a response is received from Twilio
            res.redirect('/login');
        })
      }
    });
  });


  // GET Login page
  router.get('/login', function(req, res) {
    res.render('login');
  });

  // POST Login page
  router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
  });

  //login wall
  router.use(function(req, res, next) {
    if (req.user) {
      next()
    } else {
      res.redirect('/login')
    }
  })

  //verification
  router.get('/verification', function(req, res) {
    res.render('verification')
  });

  router.post('/verification', function(req, res) {
    var code = req.body.verification;
    if (parseInt(code) === req.user.verification) {
      req.user.verification = null;
      req.user.save(function(err, user) {
        res.redirect('/login')
      });
    } else {
      res.send('error, wrong verification code')
    }
  })

  // GET Logout page
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });

  //verification wall
  router.use(function(req, res, next) {
    if (!req.user.verification) {
      next()
    } else {
      res.redirect('/verification')
    }
  })


  //FACEBOOK
  router.get('/auth/facebook', passport.authenticate('facebook'));

  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/shipping');
    });


  return router;
};
