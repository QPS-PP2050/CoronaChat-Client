const ipcRenderer = require('electron').ipcRenderer; 
const dialog = require('electron').remote.dialog;
const {ClientSocket} = require('./ClientSocket');
var $, jQuery;
$ = jQuery = require('jquery');
const prompt = require('electron-prompt');
var server_id;

let socket = new ClientSocket();
socket.connect(window.localStorage.getItem('token'));
  





var ui = {
  messages: $('#messages')
}

var username = `Test ${Math.round(Math.random() * 1000)}`;

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
  $('#add-channel').on('click', function(){
    prompt({
        title: 'New Channel',
        label: 'Channel Name',
        type: 'input',
        alwaysOnTop: true,
    })
    .then((result) => {
        if(result !== null) {
           ipcRenderer.send('new-channel', {name : result, server: server_id});
        }
    })
    .catch(console.error);
  });

  $("#channel-list .join-channel").on("click", function(e){
    server_id = $(this).data("channel");
    socket.changeChannel(server_id);
  });
  $("#server .init").on("click", function(e){
    socket.connectServer($(this).data("server"));
  });
  $("#connect").on("click", function(e){
    socket.joinVoice(1, 1, $('#audio-channel'));
  });
  $("#settings").on("click", function(e)
  {
    if($(".setting-menu").hasClass("show"))
    {
      $(".setting-menu").removeClass("show");
    }
    else
    {
      $(".setting-menu").addClass("show");
    }
  });
  $("#logout-button").on("click", function(e){
    var result = dialog.showMessageBoxSync({
      type: "warning",
      buttons: ["Yes", "No"],
      title: "Logout",
      message: "Are you sure you want to logout?"
    }) == 0 ? true : false;
    if(result)
    {
      ipcRenderer.send('logout');
    }
  });
  $("#setting-button").on("click", function(e){
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
  if(!$('#settings').is(e.target) && $("#settings").has(e.target).length === 0)
  {
    $('.setting-menu').removeClass('show');
  }
});

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