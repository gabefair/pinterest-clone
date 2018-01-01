var mongoose = require('mongoose');
var user = process.env.USER;
var password = process.env.PASSWORD;
var mongoUri = "mongodb://"+user+":"+password+"@ds127731.mlab.com:27731/pintrest";
mongoose.connect(mongoUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, "Database error: "));
var schema = mongoose.Schema;
var commentSchema = new schema({
    text: String,
    //Text is the comment text
    userId: Number,
    userName: String,
    commentId: Number,
    //UserId is the userid of the commenter
    likes: [Number]
    //Same as above
});
var postSchema = new schema({
    text: String,
    //Text is the subtitle
    url: String,
    //Url is the url to the image
    likes: [Number],
    //Likes is an array of userId's who liked the picture
    userId: Number,
    userName: String,
    postId: Number,
    //UserId is the id of the user who posted the image
    comments:[commentSchema]
    //Comments is an array of all the comments
});
var Post = mongoose.model('Post', postSchema);
var Comment = mongoose.model('Comment', commentSchema);
module.exports.Post = Post;
module.exports.Comment = Comment;