var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require("../models/User.js").User;
var init = require('../init.js');

passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
    }, function(email, password, done){
    User.find({email: email}, function(err, user){
        user = user[0];
        if(err) throw err;
        if(!user) return done(null, false);
        if(user.password!==password) return done(null, false);
        return done(null, user);
    });
}));
init();

module.exports = passport;