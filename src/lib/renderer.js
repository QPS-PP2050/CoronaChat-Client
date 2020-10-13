const ipcRenderer = require('electron').ipcRenderer;
const dialog = require('electron').remote.dialog;
const { ClientSocket } = require('./ClientSocket');
var $, jQuery;
$ = jQuery = require('jquery');
const prompt = require('electron-prompt');
var server_id;
const Store = require('electron-store');
const store = new Store();
let socket = new ClientSocket();

const mediaSoup = require('mediasoup-client');
console.log(store.get('volume'));

if (!store.has('volume')) {
  store.set('volume', 100);
}
if (!store.has('mic'))
{
  store.set('mic', 'default');
}



socket.connect(store.get('token'));


var ui = {
  messages: $('#messages')
}

var username = `Test ${Math.round(Math.random() * 1000)}`;

//Submits input form and sends message
$(function () {
  $("#send-msg").submit(function (e) {
    e.preventDefault();
    //Checks if input is empty and only contains white spaces
    if ($("#message").val().length && $("#message").val().trim().length) {
      //Sends message to the server
      socket.send({ username, msg: $("#message").val() })
      $("#message").val('');
    }
  });
});

//Dropsdown and closes server list
$(function () {
  $('#delete-account').on('click', function (e) {
    var result = dialog.showMessageBoxSync({
      type: "warning",
      buttons: ["Yes", "No"],
      title: "Delete",
      message: "Are you sure you want to delete your account?"
    }) == 0 ? true : false;
    if (result) {
      ipcRenderer.send('delete-account', $("#username").data('id'));
      ipcRenderer.send('logout');
    }
  });
  $('#apply-volume').on('click', function () {
    store.set('volume', $('#audio-level').val());
    store.set('mic', $('#mic-setting').val());
  });
  $('#audio-level').change(function () {
    $('#level').empty();
    $('#level').append($(this).val());
  });
  $('#profile').on('click', function () {
    $('#profile-panel').visible();
    $('#audio-settings').invisible();
  });
  $('#audio').on('click', function () {
    $('#profile-panel').invisible();
    $('#audio-settings').visible();
  });
  $('#password-change').on('click', function () {
    var current_password = $('#current-password').val();
    var new_password = $('#new-password').val();
    ipcRenderer.send('change-password', { current_password, new_password });
  });
  $('#username-change').on('click', function () {
    var username = $('#new-username').val();
    var password = $('#user-password').val();
    ipcRenderer.send('change-username', { username, password });
  });
  $('#profile-panel .cancel').on('click', function () {
    $('#change-username-pane').removeClass('show');
    $('#change-password-pane').removeClass('show');
  });
  $('#change-password').on('click', function () {
    $('#change-username-pane').removeClass('show');
    hasShow($('#change-password-pane'));
  });
  $('#change-username').on('click', function () {
    $('#change-password-pane').removeClass('show');
    hasShow($('#change-username-pane'));
  });
  $('#add-channel').on('click', function () {
    prompt({
      title: 'New Channel',
      label: 'Channel Name',
      type: 'input',
      alwaysOnTop: true,
    })
      .then((result) => {
        if (result !== null) {
          ipcRenderer.send('new-channel', { name: result, server: server_id });
        }
      })
      .catch(console.error);
  });

  $("#channel-list").on("click",".join-channel" , function (e) {
    
    server_id = $(this).data("channel");
    socket.changeChannel(server_id);
  });
  $("#server").on("click", ".init", function (e) {
    socket.connectServer($(this).data("server"));
  });
  $('#join-voice').on('click', function(){
    $('#disconnect-voice').visible();
    socket.joinVoice($(this).data('server'), 'voice', $('#remote-audio'), mediaSoup);
    socket.startVoice();
  });
  $('#disconnect-voice').on('click', function(){
    socket.stopVoice();
    $(this).invisible();
  });
  $("#connect").on("click", function (e) {
    socket.joinVoice(1, 1, $('#audio-channel'));
  });
  $("#settings").on("click", function (e) {
    hasShow($(".setting-menu"));
    audioSetup($('#mic-setting'));
    $('#level').empty();
    $('#level').append(store.get('volume'));
    $('#audio-level').val(store.get('volume'));
  });
  $("#logout-button").on("click", function (e) {
    var result = dialog.showMessageBoxSync({
      type: "warning",
      buttons: ["Yes", "No"],
      title: "Logout",
      message: "Are you sure you want to logout?"
    }) == 0 ? true : false;
    if (result) {
      ipcRenderer.send('logout');
    }
  });
  $("#setting-button").on("click", function (e) {
    $(".profile-display").visible();
  });
  $("#settings-close").on("click", function (e) {
    $('#change-username-pane').removeClass('show');
    $('#change-password-pane').removeClass('show');
    $(".profile-display").invisible();
    $("#audio-settings").invisible();
    $("#profile-panel").invisible();
  });
  $("#select").on("click", function (e) {
    if (!$(".server-list").hasClass("show")) {
      $(".server-list").addClass("show");
    }
    else {
      $(".server-list").removeClass("show");
    }
  });
});

//closes server list
$(document).on('mouseup', function (e) {
  if (!$("#select").is(e.target) && $("#select").has(e.target).length === 0) {
    $(".server-list").removeClass("show");
  }
  if (!$('#settings').is(e.target) && $("#settings").has(e.target).length === 0) {
    $('.setting-menu').removeClass('show');
  }
});

function hasShow(element) {
  if (element.hasClass('show'))
    element.removeClass('show');
  else
    element.addClass('show');
}

function audioSetup(element) {
  element.empty();
  navigator.mediaDevices.enumerateDevices().then(devices =>
    devices.forEach(device => {
      let el = null
      if ('audioinput' === device.kind) {
        element.append(`<option value='${device.deviceId}'>${device.label}</option>`);
        if(device.deviceId === store.get('mic'))
        {
          element.val(device.deviceId);
        }
      }
    })
  );
}

$(function () {
  $.fn.invisible = function () {
    return this.each(function () {
      $(this).css("visibility", "hidden");
    });
  };
  $.fn.visible = function () {
    return this.each(function () {
      $(this).css("visibility", "visible");
    });
  };
}(jQuery));