const ipcRenderer = require('electron').ipcRenderer; 
var $, jQuery;
$ = jQuery = require('jquery');
var chat = 0;

//Submits input form and sends message
$(function(){
  $("#send-msg").submit(function(e){
    e.preventDefault();
    //Checks if input is empty and only contains white spaces
    if($("#message").val().length && $("#message").val().trim().length)
    {
      //Sends message to the server
      ipcRenderer.send('send-message', $("#message").val());
      $("#message").val('');
    }
  });
});
//Dropsdown and closes server list
$(function(){
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
$(document).mouseup(function(e){
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


//Gets updates from main process when a new message comes through
ipcRenderer.on('actionreply', (event, data) => {
  $("#messages").append(`<li>${data.text}</li>`);
  $('#chat-log').scrollTop($('#chat-log')[0].scrollHeight);
});