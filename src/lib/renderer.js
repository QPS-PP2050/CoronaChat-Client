const ipcRenderer = require('electron').ipcRenderer; 
var $, jQuery;
$ = jQuery = require('jquery');
var chat = 0;

const {ClientSocket} = require('./socket');
const socket = new ClientSocket;

socket.connect();

//Submits input form and sends message
$(function(){
  $("#send-msg").submit(function(e){
    e.preventDefault();
    //Checks if input is empty and only contains white spaces
    if($("#message").val().length && $("#message").val().trim().length)
    {
      //Sends message to the server
      socket.send($("#message").val());
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

ipcRenderer.on('update_member', (event, member) => {
  $('#mem_list').empty();
  for(var i = 0; i < member.length; i++)
  {
    $('#mem_list').append(`<li><a>${member[i]}</a></li>`);
  }
});

//Gets updates from main process when a new message comes through
ipcRenderer.on('actionreply', (event, data) => {
  $("#messages").append(`<li><b>${data.author}</b><br>${data.message}</li>`);
  $('#chat-log').scrollTop($('#chat-log')[0].scrollHeight);
});
