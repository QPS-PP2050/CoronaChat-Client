var $, jQuery;
$ = jQuery = require('jquery');

const EVENTS = {
    CONNECT : 'connect',
    DISCONNECT : 'disconnect',
    MESSAGE : 'message',
    CHANNEL : 'change-channel',
    MEMBER_UPDATE : "member_list"
}

const UI = {
    MESSAGES : '#messages',
    MEMBER_LIST : '#mem_list'
}

exports.EVENTS = EVENTS;
exports.UI = UI;