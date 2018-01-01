var passport = require('passport');
var User = require('./models/User.js').User;


module.exports = function() {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({
      id: id
      }, function (err, user) {
      done(err, user);
    });
  });

};