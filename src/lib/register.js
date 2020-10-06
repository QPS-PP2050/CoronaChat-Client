$ = jQuery = require('jquery');
const { dialog } = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer; 

$(function(){
    $("#back").on('click', function(){
        ipcRenderer.send('login-window');
    });
    //When login button is clicked, checks if the username and password fields are empty
    $('#register').on('click', function(){
        var email = $('#email').val();
        var password = $('#password').val();
        
        if(email.trim().length && password.trim().length)
        {
            //sends username and password to the socket
            ipcRenderer.send('login', {email, password});
        }
        else
        {
            //Shows error message if username or password is empty
            dialog.showErrorBox('Login', 'Email or Password is empty');
        }
    });
});