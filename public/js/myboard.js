/* global $*/
function getComments(postId) {
    $.ajax({
        url: "/getData",
        type: "POST",
        data: {
            postId: postId
        },
        success: function(data) {
            var imageUrl = data.url;
            var text = data.text;
            $("#comments").html("");
            $("#modal-img").attr('src', imageUrl);
            $("#modal-text").text(text);
            $("#modal-comment").attr("for-post", data.postId);
            var comments = data.comments;
            for (var x = 0; x < comments.length; x++) {
                var delButton = (comments[x].userId == id) ? "<button class='del-comment' type='button' for-comment='" + comments[x].commentId + "'><span class='fa fa-times-circle-o'></span></button>" : "";
                var heartClass = (comments[x].likes.indexOf(id) !== -1) ? "fa fa-heart fa-6 red" : "fa fa-heart fa-6";
                var element =
                    "<div class='comment' for-post='" + postId + "'>\
                    <p class='by-user'>" + comments[x].userName + " said:</p>\
                    <p class='comment-text'>" + comments[x].text + "</p>\
                    <button type='button' class='comment-like' for-comment='" + comments[x].commentId + "' likes='" + comments[x].likes.length + "'><span class='" + heartClass + "'></span>: " + comments[x].likes.length + "</button>\
                    " + delButton + "\
                </div>";
                $("#comments").append(element);
            }
            $(".comment-like").off('click');
            $(".del-comment").click(function() {
                var commentId = $(this).attr('for-comment');
                var postId = $(this).parent().attr('for-post');
                var parent = $(this).parent();
                $.ajax({
                    url: "/delComment",
                    type: "POST",
                    data: {
                        commentId: commentId,
                        postId: postId
                    },
                    success: function() {
                        parent.hide("fast", function() {
                            parent.remove();
                        });
                    }
                });
            });
            $(".comment-like").click(function() {
                var parent = $(this).parent();
                var commentId = $(this).attr('for-comment');
                var postId = parent.attr('for-post');
                var ele = $(this);
                $.ajax({
                    url: "likeComment",
                    type: "POST",
                    data: {
                        commentId: commentId,
                        postId: postId
                    },
                    success: function(liked) {
                        if (liked == "true") {
                            var likes = parseInt(ele.attr('likes')) + 1;
                            ele.attr('likes', likes);
                            ele.html("<span class='fa fa-heart fa-6 red'></span>: " + likes);
                        }
                        else {
                            var likes = parseInt(ele.attr('likes')) - 1;
                            ele.attr('likes', likes);
                            ele.html("<span class='fa fa-heart fa-6'></span>: " + likes);
                        }
                    }
                });
            });
            $(".modal").show("fast");
            $("#modal-content-post").show("fast");
            $("#modal-content-add").hide("fast");
        },
        error: function() {

        }
    });
}
$(window).on('load', function() {
    $('.grid').masonry({
        itemSelector: '.grid-item',
        percentPosition: true
    });
    $("#add").click(function() {
        $(".modal").show("fast");
        $("#modal-content-add").show("fast");
        $("#modal-content-post").hide("fast");
    });
    $("#url").change(function() {
        var val = $(this).val();
        $("#image").attr("src", val);
        if ($("image").width() == 0) {
            $("#image").attr("src", "/img/image-not-found.jpg");
        }
        $("#picture").val("");
    });
    $("#image").on("error", function() {
        $("#url").val("/img/image-not-found.jpg");
        $("#image").attr("src", "/img/image-not-found.jpg");
    });
    $("#close").click(function() {
        $(".modal").hide("fast");
    });
    $(".del-button").click(function() {
        var parent = $(this).parent();
        var id = $(this).attr('for-post');
        $.ajax({
            url: "/delete",
            type: "POST",
            data: {
                postId: id
            },
            success: function() {
                parent.hide("fast", function() {
                    parent.remove();
                    $(".grid").masonry('destroy');
                    $(".grid").masonry();
                });
            }
        });
    });
    $(".post-click").click(function() {
        var postId = $(this).attr('for-post');
        getComments(postId);
    });
    $("#close").click(function() {
        $(".modal").hide("fast");
    });
    $(".like").click(function() {
        var thisEle = $(this);
        var id = thisEle.attr('for-post');
        $.ajax({
            url: "/like",
            method: "POST",
            data: {
                postId: id
            },
            success: function(liked) {
                if (liked == "true") {
                    var likes = parseInt(thisEle.attr('likes')) + 1;
                    thisEle.attr('likes', likes);
                    thisEle.html("<span class='fa fa-heart fa-6 red'></span>: " + likes);
                }
                else {
                    var likes = parseInt(thisEle.attr('likes')) - 1;
                    thisEle.attr('likes', likes);
                    thisEle.html("<span class='fa fa-heart fa-6'></span>: " + likes);
                }
            }
        });
    });
    $("#picture").change(function(event) {
        var selectedFile = event.target.files[0];
        var reader = new FileReader();
        var imgtag = document.getElementById("image");
        imgtag.title = selectedFile.name;
        reader.onload = function(event) {
            imgtag.src = event.target.result;
        };
        reader.readAsDataURL(selectedFile);
        $("#url").val("");
    });
    $(".grid").masonry();
});