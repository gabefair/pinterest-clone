var passport = require("passport");
var GithubStrategy = require("passport-github2").Strategy;
var User = require("../models/User.js").User;
var init = require('../init');
var config = require("./config.js");
passport.use(new GithubStrategy({
    clientID: config.github.clientId,
    clientSecret: config.github.clientSecret,
    callbackURL: config.github.callback
  },
    function(accessToken, refreshToken, profile, done){
      profile = profile._json;
      var userData = {
        username: profile.login,
        email: "",
        id: profile.id,
        password: "",
        type: "github"
      };
    User.findOne({
      id: profile.id,
      type: "github"
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
init();
module.exports = passport;