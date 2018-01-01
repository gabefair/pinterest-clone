var Post = require("./models/Post.js").Post;
var exec = require('child_process').exec;

function logData(req, res) {
    if (req.user !== undefined) {
        return {
            loggedin: req.session.active,
            name: req.user.username,
            id: req.user.id
        };
    }
    else {
        return {
            loggedin: req.session.active,
            name: "",
            id: null
        };
    }
}

function getMyPosts(req, res) {
    var id = req.user.id;
    Post.find({
        userId: id
    }, function(err, posts) {
        if (err) throw err;
        res.render("twig/myboard.twig", Object.assign({}, {
            posts: posts
        }, logData(req, res)));
    });
}

function getAllPosts(req, res) {
    Post.find({}, function(err, posts) {
        if (err) throw err;
        res.render("twig/posts.twig", Object.assign({}, {
            posts: posts
        }, logData(req, res)));
    });
}

function add(req, res) {

    var url = (req.body.url !== "") ? req.body.url : "/img/" + req.files[0].filename;
    var text = req.body.text;
    var userId = req.user.id;
    var username = req.user.username
    var postData = {
        url: url,
        text: text,
        userId: userId,
        userName: username,
        postId: Math.round(Math.random() * Math.pow(10, 17)),
        likes: [],
        comments: []
    };

    Post.create(postData, function(err, data) {
        if (err) throw err;

        getMyPosts(req, res);
    });
}

function del(req, res) {
    var postId = req.body.postId;
    var userId = req.user.id;
    Post.findOne({
        userId: userId,
        postId: postId
    }, function(err, post) {
        if (err) throw err;

        if (post.url[0] == "/") {


            exec("rm ~/workspace/pintrest/public" + post.url, function() {

                Post.remove({
                    userId: userId,
                    postId: postId
                }, function(err, data) {
                    if (err) throw err;

                    res.writeHead(200, {
                        "Content-Type": "text/json"
                    });
                    res.end(JSON.stringify(data));
                });
            });
        }
        else {
            Post.remove({
                userId: userId,
                postId: postId
            }, function(err, data) {
                if (err) throw err;

                res.writeHead(200, {
                    "Content-Type": "text/json"
                });
                res.end(JSON.stringify(data));
            });
        }
    });
}

function like(req, res) {
    var userId = req.user.id;
    var postId = req.body.postId;
    Post.findOne({
        postId: postId
    }, function(err, post) {

        if (err) throw err;
        if (post.likes.indexOf(userId) == -1) {
            Post.update({
                postId: postId
            }, {
                $push: {
                    likes: userId
                }
            }, function(err, data) {
                if (err) throw err;
                res.writeHead(200, {
                    "Content-Type": "text/bool"
                });
                res.end("true");
            });
        }
        else {
            Post.update({
                postId: postId
            }, {
                $pull: {
                    likes: userId
                }
            }, function(err, data) {
                if (err) throw err;
                res.writeHead(200, {
                    "Content-Type": "text/bool"
                });
                res.end("false");
            })
        }
    });
}

function getData(req, res) {
    var postId = req.body.postId;
    Post.findOne({
        postId: postId
    }, function(err, post) {
        if (err) throw err;
        res.writeHead(200, {
            "Content-Type": "text/json"
        });
        res.end(JSON.stringify(post));
    });
}

function addComment(req, res) {
    var comment = req.body.comment;
    var userId = req.user.id;
    var postId = req.body.postId;
    var userName = req.user.username;
    var commentData = {
        text: comment,
        userId: userId,
        commentId: Math.round(Math.random() * Math.pow(10, 17)),
        userName: userName,
        likes: []
    };
    Post.update({
        postId: postId
    }, {
        $push: {
            comments: commentData
        }
    }, function(err, data) {
        if (err) throw err;

        res.writeHead(200, {
            "Content-Type": "text/json"
        });
        res.end(JSON.stringify(data));
    });
}

function delComment(req, res) {
    var postId = req.body.postId;
    var commentId = req.body.commentId;
    var userId = req.user.id;
    Post.update({
        postId: postId,
    }, {
        $pull: {
            comments: {
                commentId: commentId,
                userId: userId
            }
        }
    }, function(err, data) {
        if (err) throw err;

        res.writeHead(200, {
            'Content-Type': 'text/json'
        });
        res.end(JSON.stringify(data));
    });
}

function likeComment(req, res) {
    var postId = req.body.postId;
    var commentId = req.body.commentId;
    var userId = req.user.id;
    Post.findOne({
        postId: postId,
    }, function(err, post) {
        if (err) throw err;
        var comment = post.comments.filter(function(ele) {

            return ele.commentId == commentId;
        });
        var liked = "true";
        comment = comment[0];

        if (comment.likes.indexOf(userId) == -1) {
            comment.likes.push(userId);
        }
        else {
            comment.likes = comment.likes.filter(function(like) {
                return like !== userId;
            });
            liked = "false";
        }
        for (var x = 0; x < post.comments.length; x++) {
            var com = post.comments[x];
            if (com.commentId == commentId) {
                post[x] = comment;
            }
        }
        Post.update({
            postId: postId
        }, post, function(err, data) {
            if (err) throw err;
            console.log(data)
            res.writeHead(200, {
                'Content-Type': 'text/bool'
            });
            res.end(liked);
        });
    });
}
module.exports.getMyPosts = getMyPosts;
module.exports.add = add;
module.exports.del = del;
module.exports.getAllPosts = getAllPosts;
module.exports.like = like;
module.exports.getData = getData;
module.exports.addComment = addComment;
module.exports.delComment = delComment;
module.exports.likeComment = likeComment;