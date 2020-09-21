$ = jQuery = require('jquery');
const { dialog } = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer; 

$(function(){
    $('#register').on('click', function(){
        ipcRenderer.send('register');
    });
    //When login button is clicked, checks if the username and password fields are empty
    $('#login').on('click', function(){
        var username = $('#username').val();
        var password = $('#password').val();
        
        if(username.trim().length && password.trim().length)
        {
            //sends username and password to the socket
            ipcRenderer.send('login', {username, password});
        }
        else
        {
            //Shows error message if username or password is empty
            dialog.showErrorBox('Login', 'Username or Password is empty');
        }
    });
});

