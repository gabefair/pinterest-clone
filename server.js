var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    sessions = require('client-sessions'),
    account = require("./app/account.js"),
    passport = require('passport'),
    twitterAuth = require("./app/auth/twitter.js"),
    githubAuth = require("./app/auth/github.js"),
    auth = require("./app/auth/local.js"),
    posts = require("./app/posts.js"),
    multer = require("multer");
var upload = multer({
    dest: './public/img'
});
app.set("views", "./public");
app.use(express.static("./public"), bodyParser(), sessions({
    cookieName: 'session',
    secret: process.env.SESSION_SECRET,
    duration: 30 * 60 * 1000,
    activeDuration: 30 * 60 * 1000,
}));
app.use(passport.initialize());
app.use(passport.session());

function getNameData(req, res) {
    if (req.user == undefined) {
        return {
            loggedin: req.session.active,
            name: "",
            email: ""
        };
    }
    else {
        return {
            loggedin: req.session.active,
            name: req.user.username,
            email: req.user.email
        };
    }
}

function checkIn(req, res, callback) {
    if (!req.session.active) {
        res.redirect("/login");
        res.end();
    }
    else {
        callback(req, res);
    }
}
app.get("/*", function(req, res, next) {

    if (req.session.active == undefined) {
        req.session.destroy();
        req.session.active = false;
    }
    if (req.user !== undefined) {
        if ((req.user.email == "" || req.user.password == "") && req.path !== "/settings") {
            res.redirect("/settings");
            res.end();
        }
        else {
            next();
        }
    }
    else {
        next();
    }
});
app.get("/", function(req, res) {
    res.render("twig/index.twig", getNameData(req, res));
});
app.get("/register", function(req, res) {
    res.render("twig/register.twig", getNameData(req, res));
});
app.get("/login", function(req, res) {
    res.render("twig/login.twig", getNameData(req, res));
});
app.post("/register", function(req, res) {
    account.reg(req, res);
});
app.get("/auth/local/login", auth.authenticate("local"), function(req, res) {

    req.session.active = true;
    res.redirect("/");
    res.end();
});
app.get("/auth/twitter/login", twitterAuth.authenticate("twitter"));
app.get('/auth/twitter/callback',
    twitterAuth.authenticate('twitter', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        req.session.active = true;
        res.redirect("/");
        res.end();
    });
app.get("/auth/github/login", githubAuth.authenticate("github"));
app.get("/auth/github/callback", githubAuth.authenticate("github"), function(req, res) {
    req.session.active = true;
    res.redirect("/");
    res.end();
});
app.get("/logout", function(req, res) {
    req.session.destroy();
    req.session.active = false;
    req.user = {};
    res.redirect("/");
    res.end();
});
app.get("/settings", function(req, res) {
    checkIn(req, res, function() {
        if (req.user.password == '' || req.user.email == '') {
            res.render("twig/settings.twig", Object.assign({}, getNameData(req, res), {
                completed: false
            }));
        }
        else {
            res.render("twig/settings.twig", Object.assign({}, getNameData(req, res), {
                completed: true
            }));
        }
    });
});
app.post("/settings", function(req, res) {
    checkIn(req, res, function() {
        account.changeData(req, res);
    });
});
app.get("/posts", function(req, res) {
    posts.getAllPosts(req, res);
});
app.get("/myboard", function(req, res) {
    checkIn(req, res, function() {
        posts.getMyPosts(req, res);
    });
});
app.post("/add", upload.any(), function(req, res) {
    checkIn(req, res, function() {
        posts.add(req, res);
    });
});
app.post("/delete", function(req, res) {
    checkIn(req, res, function() {
        posts.del(req, res);
    });
});
app.post("/like", function(req, res) {
    checkIn(req, res, function() {
        posts.like(req, res);
    });
});
app.post("/getData", function(req, res) {
    posts.getData(req, res);
});
app.post("/addComment", function(req, res) {
    checkIn(req, res, function() {
        posts.addComment(req, res);
    });
});
app.post("/delComment", function(req, res) {
    checkIn(req, res, function() {
        posts.delComment(req, res);
    });
});
app.post("/likeComment", function(req, res) {
    checkIn(req, res, function() {
        posts.likeComment(req, res);
    })
})
app.listen(process.env.PORT || 8080);
