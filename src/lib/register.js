$ = jQuery = require('jquery');
const { dialog } = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer; 



$(function(){
    //Goes back to Register
    $("#back").on('click', function(){
        ipcRenderer.send('login-window');
    });
    //Sends register information to the server
    $('#register-form').on('submit', function(e){
        e.preventDefault();
        var email = $('#email').val();
        var username = $('#username').val();
        var password = $('#password').val();
        ipcRenderer.send('register', {email, username, password});
    });
});