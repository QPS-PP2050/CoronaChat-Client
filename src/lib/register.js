$ = jQuery = require('jquery');
const { dialog } = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer; 



$(function(){
    $("#back").on('click', function(){
        ipcRenderer.send('login-window');
    });
    $('#register-form').on('submit', function(e){
        var email = $('#email').val();
        var username = $('#username').val();
        var password = $('#password').val();
        ipcRenderer.send('register', {email, username, password});
    });
});