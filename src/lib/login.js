$ = jQuery = require('jquery');
const { dialog } = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer; 

// if(window.localStorage.getItem('login') === true)
//     ipcRenderer.send('auto-login');

$(function(){
    $('#register').on('click', function(){
        ipcRenderer.send('register-window');
    });
    //When login button is clicked, checks if the username and password fields are empty
    $('#login').on('click', function(){
        var email = $('#username').val();
        var password = $('#password').val();

        var check = $('#keep-login').checked ? true : false;
        if(email.trim().length && password.trim().length)
        {
            //sends username and password to the socket
            ipcRenderer.send('login', {email, password, login: check });
        }
        else
        {
            //Shows error message if username or password is empty
            dialog.showErrorBox('Login', 'Username or Password is empty');
        }
    });
});

