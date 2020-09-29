const { ipcMain } = require('electron');

const ipcRenderer = require('electron').ipcRenderer; 
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
      ipcRenderer.send('new-message', {username, msg: $("#message").val()});
      $("#message").val('');
    }
  });
});
//Dropsdown and closes server list
$(function(){
  
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

ipcRenderer.on('message', (event, data) => {
  $("#messages").append(`<li><span class="message-content">${data.author}<br>${data.message}</span></li>`);
  $('#chat-window').scrollTop($('#chat-window').prop("scrollHeight"));
});

ipcRenderer.on('members', (event, list) => {
  console.log(list);
  $('#mem_list').empty();
  for(var i = 0; i < list.length; i++)
  {
    $('#mem_list').append(`<li><a>${list[i]}</a></li>`);
  }
})
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