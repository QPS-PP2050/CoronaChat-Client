const ipcRenderer = require('electron').ipcRenderer; 
const {ClientSocket} = require('./ClientSocket');

let socket = new ClientSocket();
socket.connect(null);

var $, jQuery;
$ = jQuery = require('jquery');
var chat = 0;

var username = `Test ${Math.round(Math.random() * 1000)}`;


console.log(window.mediasoupClient);
//Submits input form and sends message
$(function(){
  $("#send-msg").submit(function(e){
    e.preventDefault();
    //Checks if input is empty and only contains white spaces
    if($("#message").val().length && $("#message").val().trim().length)
    {
      //Sends message to the server
      socket.send({username, msg: $("#message").val()})
      $("#message").val('');
    }
  });
});
//Dropsdown and closes server list
$(function(){
  $("#server .init").on("click", function(e){
    socket.connectServer($(this).data("server"));
  });
  $("#connect").on("click", function(e){
    socket.joinVoice(1, 1, $('#audio-channel'));
  });
  $("#settings").on("click", function(e)
  {
    $(".profile-display").visible();
  });
  $("#settings-close").on("click", function(e){
    $(".profile-display").invisible();
  });
  $("#select").on("click", function(e){
    if(!$(".server-list").hasClass("show"))
    {
      $(".server-list").addClass("show");
    }
    else{
      $(".server-list").removeClass("show");
    }
  });
});
//closes server list
$(document).on('mouseup', function(e){
  if(!$("#select").is(e.target) && $("#select").has(e.target).length === 0)
  {
    $(".server-list").removeClass("show");
  }
});

//Changes the chat channel
// $(function(){
//   $(".channel").on("click", function(e){
//     chat = $(this).data("id"); 
//     ipcRenderer.send('change-channel', chat);
//   });
// });
$(function() {
    $.fn.invisible = function() {
        return this.each(function() {
            $(this).css("visibility", "hidden");
        });
    };
    $.fn.visible = function() {
        return this.each(function() {
            $(this).css("visibility", "visible");
        });
    };
}(jQuery));