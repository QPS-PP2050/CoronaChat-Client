$ = jQuery = require('jquery');
const { dialog } = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer; 

// if(window.localStorage.getItem('login') === true)
//     ipcRenderer.send('auto-login');

$(function(){
    //When login button is clicked, checks if the username and password fields are empty
    $("#login-form").on('submit', function(e){
        e.preventDefault();
        var email = $('#username').val();
        var password = $('#password').val();
        var check = $('#keep-login').prop("checked");

        //sends username and password to the server
        ipcRenderer.send('login', {email, password, login: check });
    });
    $('#register').on('click', function(){
        ipcRenderer.send('register-window');
    });
    
});

