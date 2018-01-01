function addComment(comment, postId){
    $.ajax({
        url:"/addComment",
        type:"POST",
        data:{
            comment: comment,
            postId: postId
        },
        success: function(){
            
        },
        error: function(){
            
        }
    })
}
function getComments(postId){
    $.ajax({
        url: "/getData",
        type: "POST",
        data:{
            postId: postId
        },
        success: function(data){
            var imageUrl = data.url;
            var text = data.text;
            $("#comments").html("");
            $("#modal-img").attr('src', imageUrl);
            $("#modal-text").text(text);
            $("#modal-comment").attr("for-post", data.postId);
            var comments = data.comments;
            for(var x = 0; x<comments.length; x++){
                var delButton = (comments[x].userId==id)?"<button class='del-comment' type='button' for-comment='"+comments[x].commentId+"'><span class='fa fa-times-circle-o'></span></button>":"";
                var heartClass = (comments[x].likes.indexOf(id)!==-1)?"fa fa-heart fa-6 red":"fa fa-heart fa-6";
                var element = 
                "<div class='comment' for-post='"+postId+"'>\
                    <p class='by-user'>"+comments[x].userName+" said:</p>\
                    <p class='comment-text'>"+comments[x].text+"</p>\
                    <button type='button' class='comment-like' for-comment='"+comments[x].commentId+"' likes='"+comments[x].likes.length+"'><span class='"+heartClass+"'></span>: "+comments[x].likes.length+"</button>\
                    "+delButton+"\
                </div>";
                $("#comments").append(element);
            }
            $("#modal").show("fast");
            $(".del-comment").off('click');
            $(".comment-like").off('click');
            $(".del-comment").click(function(){
               var commentId = $(this).attr('for-comment'); 
               var postId = $(this).parent().attr('for-post');
               var parent = $(this).parent();
               $.ajax({
                   url: "/delComment",
                   type: "POST",
                   data:{
                       commentId: commentId,
                       postId: postId
                   }, 
                   success: function(){
                       parent.hide("fast", function(){
                           parent.remove();
                       });
                   }
               });
            });
            $(".comment-like").click(function(){
                var parent = $(this).parent();
                var commentId = $(this).attr('for-comment');
                var postId = parent.attr('for-post');
                var ele = $(this);
                $.ajax({
                    url:"likeComment",
                    type:"POST",
                    data:{
                        commentId: commentId,
                        postId: postId
                    },
                    success: function(liked){
                        if(liked=="true"){
                            var likes = parseInt(ele.attr('likes'))+1;
                            ele.attr('likes', likes);
                            ele.html("<span class='fa fa-heart fa-6 red'></span>: "+likes);
                        } else{
                            var likes = parseInt(ele.attr('likes'))-1;
                            ele.attr('likes', likes);
                            ele.html("<span class='fa fa-heart fa-6'></span>: "+likes);
                        }
                    }
                });
            });
        }
    });
}
$(window).on('load', function(){
    $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: 200
    });
    $(".like").click(function(){
        var ele = $(this);
        var id = ele.attr('for-post');
        $.ajax({
            url: "/like",
            method: "POST",
            data:{
                postId: id
            },
            success: function(liked){
                if(liked=="true"){
                    var likes = parseInt(ele.attr('likes'))+1;
                    ele.attr('likes', likes);
                    ele.html("<span class='fa fa-heart fa-6 red'></span>: "+likes);
                } else{
                    var likes = parseInt(ele.attr('likes'))-1;
                    ele.attr('likes', likes);
                    ele.html("<span class='fa fa-heart fa-6'></span>: "+likes);
                }
            }
        });
    });
    $(".post-click").click(function(){
        var postId = $(this).attr('for-post');
        getComments(postId);
    });
    $("#close").click(function(){
        $("#modal").hide("fast");
    });
    $("#modal-comment").on('keydown', function(e){
        var postId = $(this).attr('for-post');
        if(e.which==13){
            addComment($(this).val(), $(this).attr('for-post'));
            $(this).val("");
            getComments(postId);
        }
    });
    $(".grid").masonry();
});