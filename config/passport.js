var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var User = require('../model/adminUserSchema')

// Serialize passport
passport.serializeUser((user, done) => {
  // var sessionUser = {_id: user._id, username: user.username, email: user.email}
  done(null, user._id)
})

// Deserialize passport user
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

// middleware
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  User.findOne({admin_email: email}, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, req.flash('loginMessage', "No user has been found"));
    }
    if (!user.comparePassword(password)) {
      return done(null, false, req.flash('loginMessage', "Oops!, Wrong Password"));
    }
    return done(null, user);
  })
}))

module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  } else {
    req.session.reset()
    res.redirect('/login')
  }
}
