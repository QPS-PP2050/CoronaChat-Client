const ipcRenderer = require('electron').ipcRenderer;
const dialog = require('electron').remote.dialog;
const { remote, Renderer } = require('electron')
const { Menu, MenuItem } = remote
const { ClientSocket } = require('./ClientSocket');
var $, jQuery;
$ = jQuery = require('jquery');
const prompt = require('electron-prompt');
var server_id;
var server;
const Store = require('electron-store');
const store = new Store();
let socket = null;
let pm_user = null;

setup();

ipcRenderer.on('delete-account', (event, data) => {
  if (data.result) {
    ipcRenderer.send('logout');
  }
});

ipcRenderer.on('update-username', () => {
  $('#username').text(store.get('token').username);
});

//Submits input form and sends message
$(function () {
  //Sends message to server
  $("#send-msg").submit(function (e) {
    sendMessage(e);
  });
  //Sends message to PM
  $('#send-pm').submit(function (e){
    e.preventDefault();
    socket.send({ username: store.get('token').username, msg: $("#message").val()}, pm = true);
    $("#pm-message").val('');
  });
  //Closes PM window
  $('#close-chat').on('click', function (e) {
    $('#pm-chat').invisible();
    $('#pm-messages').empty();
  });
  //Deletes account
  $('#delete-account').on('click', function (e) {
    var result = messagePrompt("Delete", "Are you sure you want to delete your account?");
    if (result) {
      ipcRenderer.send('delete-account', { userID: store.get('token').id });
    }
  });
  //Context menu when right click on a user
  $('#mem_list').on('contextmenu', '.member', function (e) {
    const menu = new Menu();
    var user = $(this).text();
    menu.append(new MenuItem({ label: "Message", click() 
    { 
      //Click on message opens up the pm window
      $('#pm-chat').visible();
      socket.pmUser(user);
    } 
  }));
    menu.popup({ window: remote.getCurrentWindow() }, false);
  });
  //Applies the volume for voice and the input device
  $('#apply-volume').on('click', function () {
    store.set('volume', $('#audio-level').val());
    store.set('mic', $('#mic-setting').val());
  });
  //Changes the display of the volume
  $('#audio-level').change(function () {
    $('#level').empty();
    $('#level').append($(this).val());
  });
  //Displays the profile of the user
  $('#profile').on('click', function () {
    $('#profile-panel').visible();
    $('#audio-settings').invisible();
  });
  //Displays the audio settings
  $('#audio').on('click', function () {
    $('#profile-panel').invisible();
    $('#audio-settings').visible();
  });
  //Changes password of user
  $('#password-change').on('click', function () {
    var current_password = $('#current-password').val();
    var password = $('#new-password').val();
    ipcRenderer.send('change-password', { password });
  });
  //Changes the username of the user
  $('#username-change').on('click', function () {
    var username = $('#new-username').val();
    var password = $('#user-password').val();
    ipcRenderer.send('change-username', { username });
  });
  //closes the change username or password
  $('#profile-panel .cancel').on('click', function () {
    $('#change-username-pane').removeClass('show');
    $('#change-password-pane').removeClass('show');
  });
  //Shows the change username
  $('#change-password').on('click', function () {
    $('#change-username-pane').removeClass('show');
    hasShow($('#change-password-pane'));
  });
  //Shows the change password
  $('#change-username').on('click', function () {
    $('#change-password-pane').removeClass('show');
    hasShow($('#change-username-pane'));
  });
  //Changes the text channel or joins the voice
  $("#channel-list").on("click", ".join-channel", function (e) {
    console.log($(this).data('type'));
    if ($(this).data('type') === 'text') {
      var data = {
        name: $(this).data('name'),
        id: $(this).data('channel'),
      };
      socket.changeChannel(data);
    }
    else {
      $('#disconnect-voice').visible();
      socket.startVoice();
    }
  });
  //Changes the server
  $("#server").on("click", ".init", function (e) {
    server = {
      id: $(this).data("server"),
      name: $(this).data("name")
    }
    console.log(server);
    socket.connectServer(server);
  });
  //Disconnects the user from voice chat
  $('#disconnect-voice').on('click', function () {
    socket.stopVoice();
    $(this).invisible();
  });
  $("#connect").on("click", function (e) {
    socket.joinVoice(1, 1, $('#audio-channel'));
  });
  //Frops down settings menu
  $("#settings").on("click", function (e) {
    hasShow($(".setting-menu"));
    audioSetup($('#mic-setting'));
    $('#level').empty();
  });
  //Drops down the friends menu
  $("#friend").on("click", function (e) {
    hasShow($(".friends-menu"));
  });
  //Logs out user
  $("#logout-button").on("click", function (e) {
    var result = messagePrompt("Logout", "Are you sure you want to logout?");
    if (result) {
      ipcRenderer.send('logout');
    }
  });
  //Displays the settings menu and the profile window
  $("#setting-button").on("click", function (e) {
    $(".profile-display").visible();
  });
  //Closes the profile and settings window
  $("#settings-close").on("click", function (e) {
    $('#change-username-pane').removeClass('show');
    $('#change-password-pane').removeClass('show');
    $(".profile-display").invisible();
    $("#audio-settings").invisible();
    $("#profile-panel").invisible();
  });
  //Drops down the server list
  $("#select").on("click", function (e) {
    if (!$(".server-list").hasClass("show")) {
      $(".server-list").addClass("show");
    }
    else {
      $(".server-list").removeClass("show");
    }
  });
  //adds new channel to the server
  $('#add-channel').on('click', function () {
    prompt({
      title: 'New Channel',
      label: 'Channel Name',
      type: 'input',
      alwaysOnTop: true,
    }).then((result) => {
      if (result !== null) {
        ipcRenderer.send('new-channel', { name: result, server: server.id, type: "text" });
        socket.updateChannel();
      }
    }).catch(console.error);
  });
});

//closes server list, Settings list, friends list
$(document).on('mouseup', function (e) {
  if (!$("#select").is(e.target) && $("#select").has(e.target).length === 0) {
    $(".server-list").removeClass("show");
  }
  if (!$('#settings').is(e.target) && $("#settings").has(e.target).length === 0) {
    $('.setting-menu').removeClass('show');
  }
  if (!$('#friend').is(e.target) && $("#friend").has(e.target).length === 0) {
    $('.friends-menu').removeClass('show');
  }
});

//A function that adds or removes css class show
function hasShow(element) {
  if (element.hasClass('show'))
    element.removeClass('show');
  else
    element.addClass('show');
}

//Sets up the avaliable mic settings for voice
function audioSetup(element) {
  element.empty();
  navigator.mediaDevices.enumerateDevices().then(devices =>
    devices.forEach(device => {
      if ('audioinput' === device.kind) {
        element.append(`<option value='${device.deviceId}'>${device.label}</option>`);
        if (device.deviceId === store.get('mic')) {
          element.val(device.deviceId);
        }
      }
    })
  );
}

//Simple function for element visilility
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



//Shows Message prompt, yes or no
function messagePrompt(title, message) {
  return dialog.showMessageBoxSync({
    type: "warning",
    buttons: ["Yes", "No"],
    title: title,
    message: message
  }) == 0 ? true : false;
}

//Sends message to the server
function sendMessage(e) {
  e.preventDefault();
  //Checks if input is empty and only contains white spaces
  if ($("#message").val().length && $("#message").val().trim().length) {
    
    if($("#message").val().startsWith('/kick'))
    {
      const username = $("#message").val().split(' ')[1];
      ipcRenderer.send('kick-user', { server: server.id, username });
      socket.push('kick-user', { server: server.id, username })
      $("#message").val('');
    }
    else if ($("#message").val().startsWith('/invite')) {
      const username = $("#message").val().split(' ')[1];
      ipcRenderer.send('invite-user', { server: server.id, username });
      socket.push('invite-user', { server: server.id, username })
      $("#message").val('');
    }
    else {
      //Sends message to the server
      socket.send({ username: store.get('token').username, msg: $("#message").val() })
      $("#message").val('');
    }
  }
}

//Setup
function setup() {
  socket = new ClientSocket();
  if (!store.has('volume')) {
    store.set('volume', 100);
  }
  if (!store.has('mic')) {
    store.set('mic', 'default');
  }
  if (store.has('token')) {
    socket.connect(store.get('token'));
  }
  audioSetup($('#mic-setting'));
  $('#username').text(store.get('token').username);
  $('#level').append(store.get('volume'));
  $('#audio-level').val(store.get('volume'));
}