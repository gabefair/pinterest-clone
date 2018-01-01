var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/User').User;
var init = require('../init');
var config = require("./config.js");
passport.use(new TwitterStrategy({
    consumerKey: config.twitter.CONSUMER_KEY,
    consumerSecret: config.twitter.CONSUMER_SECRET,
    callbackURL: config.twitter.callback
  },
  function(accessToken, refreshToken, profile, done) {
    profile = profile._json;
    var userData = {
          username: profile.screen_name,
          email: "",
          id: profile.id,
          password: "",
          type:"twitter"
    };
    User.findOne({
      id: profile.id,
      type: "twitter"
    }, function(err, users){
      if(err) throw err;
      if(users.length==0){
        User.create(userData, function(err, data){
          if(err) throw err;
          return done(err, data);
        });
      } else{
        return done(err, users);
      }
    });
  }
));

// serialize user into the session
init();


module.exports = passport;