$ = jQuery = require('jquery');
const { dialog } = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer; 
var pjson = require('../../../package.json');

$(function(){
    $('#register').on('click', function(){
        ipcRenderer.send('register');
    });
});
console.log(pjson.version);
